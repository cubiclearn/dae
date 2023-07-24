import type { NextApiRequest, NextApiResponse } from 'next'
import { getSession } from 'next-auth/react'
import { getUserCourseCredentials } from '../../../../../lib/api'
import { Address } from 'viem'
import { createPublicClient } from 'viem'
import { ChainKey } from '@dae/chains'
import { config as TransportConfig } from '@dae/viem-config'
import { CredentialsBurnableAbi } from '@dae/abi'
import { decodeEventLog } from 'viem'
import { CredentialIssuedLog } from '@dae/types'
import { prisma } from '@dae/database'

// TypeScript enum for request methods
enum HttpMethod {
  GET = 'GET',
  POST = 'POST',
}

const handleGetRequest = async (req: NextApiRequest, res: NextApiResponse) => {
  const { chainId, courseAddress, userAddress } = req.query as {
    chainId: string
    courseAddress: Address
    userAddress: Address
  }

  if (!chainId || !courseAddress || !userAddress) {
    res.status(401).json({ message: 'Bad request' })
    return
  }

  const credentials = await getUserCourseCredentials(
    userAddress,
    courseAddress,
    parseInt(chainId),
  )

  res.status(200).json({ credentials: credentials })
}

const handlePostRequest = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { txHash, discordUsername, userEmail, chainId } = req.body

    if (!chainId || !txHash) {
      res.status(401).json({ message: 'Bad request' })
      return
    }

    const client = createPublicClient({
      chain: ChainKey[chainId],
      transport: TransportConfig[chainId].transport,
    })

    const txRecept = await client.getTransactionReceipt({
      hash: txHash,
    })

    const courseAddress: Address = txRecept.to

    const txLogsDecoded = txRecept.logs.map((log) => {
      return decodeEventLog({
        abi: CredentialsBurnableAbi,
        data: log.data,
        topics: log.topics,
      })
    })

    const issuedLog = txLogsDecoded.filter(
      (log: any) => log.eventName === 'Issued',
    ) as [CredentialIssuedLog]

    const tokenURI = await client.readContract({
      abi: CredentialsBurnableAbi,
      address: courseAddress,
      functionName: 'tokenURI',
      args: [issuedLog[0].args.tokenId],
    })

    const splittedURI = tokenURI.split('/')
    const ipfsCID = splittedURI[splittedURI.length - 1]

    await prisma.userCredentials.create({
      data: {
        course: {
          connect: {
            address_chain_id: {
              address: courseAddress,
              chain_id: parseInt(chainId),
            },
          },
        },
        user_address: issuedLog[0].args.to,
        credential: {
          connect: {
            course_address_ipfs_cid: {
              ipfs_cid: ipfsCID,
              course_address: courseAddress,
            },
          },
        },
        email: discordUsername ? discordUsername : '',
        discord_handle: userEmail ? userEmail : '',
      },
    })

    res.status(200).json({ success: true, data: null })
  } catch (error: any) {
    console.log(error)
    res.status(500).json({ success: false, error: error.message })
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  // Check if req.method is defined
  if (req.method === undefined) {
    return res.status(400).json({ message: 'Request method is undefined' })
  }

  // Guard clause for unsupported request methods
  if (!(req.method in HttpMethod)) {
    return res.status(400).json({ message: 'This method is not supported' })
  }
  // Guard clause for unauthenticated requests
  const session = await getSession({ req })
  if (!session) {
    return res.status(401).json({ message: 'Unauthenticated' })
  }

  // Handle the respective request method
  switch (req.method) {
    case HttpMethod.GET:
      return handleGetRequest(req, res)
    case HttpMethod.POST:
      return handlePostRequest(req, res)
    default:
      return res.status(400).json({ message: 'This method is not supported' })
  }
}