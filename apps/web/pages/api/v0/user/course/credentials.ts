import type { NextApiRequest, NextApiResponse } from 'next'
import { getSession } from 'next-auth/react'
import { getUserCourseCredentials } from '../../../../../lib/api'
import { Address, zeroAddress } from 'viem'
import { createPublicClient } from 'viem'
import { ChainKey } from '@dae/chains'
import { config as TransportConfig } from '@dae/viem-config'
import { CredentialsBurnableAbi } from '@dae/abi'
import { decodeEventLog } from 'viem'
import { CredentialIssuedLog, CredentialTransferLog } from '@dae/types'
import { Prisma, UserCredentials, prisma } from '@dae/database'
import { sanitizeAddress } from '../../../../../lib/functions'

// TypeScript enum for request methods
enum HttpMethod {
  GET = 'GET',
  POST = 'POST',
  DELETE = 'DELETE',
}

type EnrollUserData = {
  address: Address
  email: string
  discord: string
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

  res.status(200).json({ success: true, data: { credentials: credentials } })
}

const handleDeleteRequest = async (
  req: NextApiRequest,
  res: NextApiResponse,
) => {
  const { txHash, chainId } = req.query as {
    txHash: Address
    chainId: string
  }

  if (!chainId || !txHash) {
    res.status(401).json({ message: 'Bad request' })
    return
  }

  try {
    const client = createPublicClient({
      chain: ChainKey[chainId],
      transport: TransportConfig[chainId].transport,
    })

    const txRecept = await client.getTransactionReceipt({
      hash: txHash,
    })

    const txLogsDecoded = txRecept.logs.map((log) => {
      return {
        ...decodeEventLog({
          abi: CredentialsBurnableAbi,
          data: log.data,
          topics: log.topics,
        }),
        address: log.address,
      }
    })

    const transferLogs = txLogsDecoded.filter(
      (log: any) => log.eventName === 'Transfer',
    ) as [CredentialTransferLog & { address: Address }]

    const burnLogs = transferLogs.filter((log) => log.args.to === zeroAddress)

    if (burnLogs.length === 0) {
      return res.status(500).json({
        success: false,
        error: 'There are no burn logs inside this transaction.',
      })
    }

    const burnData = await prisma.userCredentials.delete({
      where: {
        user_address_course_address_credential_token_id_course_chain_id: {
          course_address: sanitizeAddress(burnLogs[0].address),
          user_address: sanitizeAddress(burnLogs[0].args.from),
          credential_token_id: Number(burnLogs[0].args.tokenId),
          course_chain_id: parseInt(chainId as string),
        },
      },
    })

    await prisma.transactionsVerifications.update({
      where: {
        transaction_hash: txHash,
      },
      data: {
        verified: true,
      },
    })

    return res.status(200).json({ success: true, data: burnData })
  } catch (error: any) {
    console.log(error)
    return res.status(500).json({ success: false, error: error.message })
  }
}

const handlePostRequest = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { txHash, usersData, chainId } = req.body as {
      txHash: Address
      usersData: EnrollUserData[]
      chainId: string
    }

    if (!chainId || !txHash || !usersData) {
      res.status(401).json({ success: false, error: 'Bad request' })
      return
    }

    const client = createPublicClient({
      chain: ChainKey[chainId],
      transport: TransportConfig[chainId].transport,
    })

    const txRecept = await client.getTransactionReceipt({
      hash: txHash,
    })

    const courseAddress = txRecept.to as Address

    const txLogsDecoded = txRecept.logs.map((log) => {
      return decodeEventLog({
        abi: CredentialsBurnableAbi,
        data: log.data,
        topics: log.topics,
      })
    })

    const issuedLogs = txLogsDecoded.filter(
      (log: any) => log.eventName === 'Issued',
    ) as [CredentialIssuedLog]

    const createData = await Promise.all(
      usersData.map(async (userData) => {
        const userIssuedLogs = issuedLogs.filter(
          (log) =>
            sanitizeAddress(log.args.to) === sanitizeAddress(userData.address),
        )
        const tokenId = userIssuedLogs[0].args.tokenId

        const tokenURI = await client.readContract({
          abi: CredentialsBurnableAbi,
          address: courseAddress,
          functionName: 'tokenURI',
          args: [tokenId],
        })

        const splittedURI = tokenURI.split('/')
        const ipfsCID = splittedURI[splittedURI.length - 1]

        // Verify that the credential does not already exist
        const credential = await prisma.credential.findUnique({
          where: {
            course_address_course_chain_id_ipfs_cid: {
              course_address: sanitizeAddress(courseAddress),
              ipfs_cid: ipfsCID,
              course_chain_id: parseInt(chainId as string),
            },
          },
        })

        if (!credential) {
          return null
        }

        return {
          course_address: sanitizeAddress(courseAddress),
          user_address: sanitizeAddress(userData.address),
          credential_token_id: Number(tokenId),
          credential_ipfs_cid: credential.ipfs_cid,
          course_chain_id: parseInt(chainId),
          user_email: userData.email,
          user_discord_handle: userData.discord,
        } as UserCredentials
      }),
    )

    const validCreateData = createData.filter(
      (data) => data !== null,
    ) as Prisma.UserCredentialsCreateManyInput[]

    await prisma.userCredentials.createMany({
      data: validCreateData,
    })

    await prisma.transactionsVerifications.update({
      where: {
        transaction_hash: txHash,
      },
      data: {
        verified: true,
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
    return res
      .status(400)
      .json({ success: false, error: 'Request method is undefined' })
  }

  // Guard clause for unsupported request methods
  if (!(req.method in HttpMethod)) {
    return res
      .status(400)
      .json({ success: false, error: 'This method is not supported' })
  }
  // Guard clause for unauthenticated requests
  const session = await getSession({ req })
  if (!session) {
    return res.status(401).json({ success: false, error: 'Unauthenticated' })
  }

  // Handle the respective request method
  switch (req.method) {
    case HttpMethod.GET:
      return handleGetRequest(req, res)
    case HttpMethod.POST:
      return handlePostRequest(req, res)
    case HttpMethod.DELETE:
      return handleDeleteRequest(req, res)
    default:
      return res
        .status(400)
        .json({ success: false, error: 'This method is not supported' })
  }
}
