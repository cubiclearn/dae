import type { NextApiRequest, NextApiResponse } from 'next'
import { getSession } from 'next-auth/react'
import { getUserCourseCredentials } from '../../../../../lib/api'
import { Address } from 'viem'
import { createPublicClient } from 'viem'
import { ChainKey } from '@dae/chains'
import { config as TransportConfig } from '@dae/viem-config'
import { CredentialsBurnableAbi } from '@dae/abi'
import { decodeEventLog } from 'viem'
import { ApiResponse, ApiResponseStatus, CredentialIssuedLog } from '@dae/types'
import { Prisma, UserCredentials, prisma } from '@dae/database'
import { sanitizeAddress } from '../../../../../lib/functions'
import { Credential } from '@dae/database'
import { CONFIRMATION_BLOCKS } from '@dae/constants'

// TypeScript enum for request methods
enum HttpMethod {
  GET = 'GET',
  POST = 'POST',
}

type UserCredentialData = {
  address: Address
  email: string
  discord: string
}

const handleGetRequest = async (
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<{ credentials: Credential[] }>>,
) => {
  try {
    const { chainId, courseAddress, userAddress } = req.query as {
      chainId: string
      courseAddress: Address
      userAddress: Address
    }

    if (!chainId || !courseAddress || !userAddress) {
      return res
        .status(400)
        .json({ status: ApiResponseStatus.error, message: 'Bad request.' })
    }

    const credentials = await getUserCourseCredentials(
      userAddress,
      courseAddress,
      parseInt(chainId),
    )

    res.status(200).json({
      status: ApiResponseStatus.success,
      data: { credentials: credentials },
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({
      status: ApiResponseStatus.error,
      message:
        error.message ||
        'An error occurred while processing your request. Please try again later.',
    })
  }
}

const handlePostRequest = async (
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<{ credentials: UserCredentials[] }>>,
) => {
  try {
    const { txHash, usersData, chainId } = req.body as {
      txHash: Address
      usersData: UserCredentialData[] | undefined
      chainId: string
    }

    if (!chainId || !txHash) {
      return res
        .status(400)
        .json({ status: ApiResponseStatus.error, message: 'Bad request.' })
    }

    const client = createPublicClient({
      chain: ChainKey[chainId],
      transport: TransportConfig[chainId].transport,
    })

    const txRecept = await client.waitForTransactionReceipt({
      hash: txHash,
      confirmations: CONFIRMATION_BLOCKS,
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
    ) as CredentialIssuedLog[]

    if (issuedLogs.length === 0) {
      await prisma.transactionsVerifications.update({
        where: {
          transaction_hash: txHash,
        },
        data: {
          verified: true,
        },
      })
      return res.status(400).json({
        status: ApiResponseStatus.error,
        message: 'This transaction seams not to contain burn logs.',
      })
    }

    const createData = await Promise.all(
      issuedLogs.map(async (log) => {
        const tokenId = log.args.tokenId
        const tokenURI = await client.readContract({
          abi: CredentialsBurnableAbi,
          address: courseAddress,
          functionName: 'tokenURI',
          args: [tokenId],
        })
        const splittedURI = tokenURI.split('/')
        const ipfsCID = splittedURI[splittedURI.length - 1]
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

        const credentialUserData = usersData?.filter(
          (usersData) => usersData.address === log.args.to,
        )[0]

        return {
          course_address: sanitizeAddress(courseAddress),
          user_address: sanitizeAddress(log.args.to),
          credential_token_id: Number(tokenId),
          credential_ipfs_cid: credential.ipfs_cid,
          course_chain_id: parseInt(chainId),
          user_email: credentialUserData?.email ?? '',
          user_discord_handle: credentialUserData?.discord ?? '',
        } as UserCredentials
      }),
    )

    const validCreateData = createData.filter(
      (data) => data !== null,
    ) as UserCredentials[]

    await prisma.userCredentials.createMany({
      data: validCreateData as Prisma.UserCredentialsCreateManyInput[],
    })

    await prisma.transactionsVerifications.update({
      where: {
        transaction_hash: txHash,
      },
      data: {
        verified: true,
      },
    })

    res.status(200).json({
      status: ApiResponseStatus.success,
      data: { credentials: validCreateData },
    })
  } catch (error: any) {
    return res.status(500).json({
      status: ApiResponseStatus.error,
      message:
        error.message ||
        'An error occurred while processing your request. Please try again later.',
    })
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<any>>,
) {
  // Check if req.method is defined
  if (req.method === undefined) {
    return res.status(400).json({
      status: ApiResponseStatus.error,
      message: 'Request method is undefined',
    })
  }

  // Guard clause for unsupported request methods
  if (!(req.method in HttpMethod)) {
    return res.status(400).json({
      status: ApiResponseStatus.error,
      message: 'This method is not supported',
    })
  }
  // Guard clause for unauthenticated requests
  const session = await getSession({ req })
  if (!session) {
    return res
      .status(401)
      .json({ status: ApiResponseStatus.error, message: 'Unauthenticated' })
  }

  // Handle the respective request method
  switch (req.method) {
    case HttpMethod.GET:
      return handleGetRequest(req, res)
    case HttpMethod.POST:
      return handlePostRequest(req, res)
    default:
      return res.status(400).json({
        status: ApiResponseStatus.error,
        message: 'This method is not supported',
      })
  }
}
