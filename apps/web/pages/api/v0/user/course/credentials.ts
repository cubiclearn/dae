import type { NextApiRequest, NextApiResponse } from 'next'
import { getSession } from 'next-auth/react'
import { getUserCourseCredentials } from '../../../../../lib/api'
import {
  Address,
  WaitForTransactionReceiptReturnType,
  encodeEventTopics,
} from 'viem'
import { createPublicClient } from 'viem'
import { ChainId, ChainKey } from '@dae/chains'
import { config as TransportConfig } from '@dae/viem-config'
import { CredentialsBurnableAbi } from '@dae/abi'
import { decodeEventLog } from 'viem'
import { ApiResponse, ApiResponseStatus } from '@dae/types'
import { UserCredentials, prisma } from '@dae/database'
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

    const txRecept = (await client.waitForTransactionReceipt({
      hash: txHash,
      confirmations: CONFIRMATION_BLOCKS,
    })) as WaitForTransactionReceiptReturnType

    const courseAddress = txRecept.to as Address

    const credentialIssuedEventHash = encodeEventTopics({
      abi: CredentialsBurnableAbi,
      eventName: 'Issued',
    })[0]

    const credentialsIssuedLogs = txRecept.logs.filter(
      (log) => log.topics[0] === credentialIssuedEventHash,
    )

    const credentialsIssuedLogsDecoded = credentialsIssuedLogs.map((log) =>
      decodeEventLog({
        abi: CredentialsBurnableAbi,
        data: log.data,
        topics: log.topics,
        eventName: 'Issued',
      }),
    )

    const multicallAddress =
      ChainKey[Number(chainId) as ChainId].contracts?.multicall3?.address

    let tokenURIs: string[]
    if (multicallAddress) {
      const multicallTokenURIResponses = await client.multicall({
        multicallAddress,
        contracts: credentialsIssuedLogsDecoded.map((log) => ({
          abi: CredentialsBurnableAbi,
          address: courseAddress,
          functionName: 'tokenURI',
          args: [log.args.tokenId],
        })),
      })

      // ONLY BEFORE TOKEN_URI FIX
      const tempFixTokenURIResponse = multicallTokenURIResponses.map(
        (tokenURI) => {
          return {
            result: tokenURI.result
              ? tokenURI.result.split('/').slice(-1)[0]
              : undefined,
          }
        },
      )
      ///////////

      tokenURIs = tempFixTokenURIResponse.map((response) => {
        return response.result ? response.result : ''
      })
    } else {
      const tokenURIResponse = await Promise.all(
        credentialsIssuedLogsDecoded.map((log) => {
          return client.readContract({
            abi: CredentialsBurnableAbi,
            address: courseAddress,
            functionName: 'tokenURI',
            args: [log.args.tokenId],
          })
        }),
      )

      // ONLY BEFORE TOKEN_URI FIX
      const tempFixTokenURIResponse = tokenURIResponse.map((tokenURI) => {
        return tokenURI.split('/').slice(-1)[0]
      })
      ///////////

      tokenURIs = tempFixTokenURIResponse.map((response) => {
        return response ? response : ''
      })
    }

    const createCredentialsData = credentialsIssuedLogsDecoded.map(
      (log, index) => {
        const credentialUserData = usersData?.filter(
          (usersData) => usersData.address === log.args.to,
        )[0]

        return {
          course_address: sanitizeAddress(courseAddress),
          user_address: sanitizeAddress(log.args.to),
          credential_token_id: Number(log.args.tokenId),
          credential_ipfs_cid: tokenURIs[index],
          course_chain_id: Number(chainId),
          user_email: credentialUserData?.email ?? '',
          user_discord_handle: credentialUserData?.discord ?? '',
          issuer: sanitizeAddress(log.args.from),
        } as UserCredentials
      },
    )

    await prisma.userCredentials.createMany({
      data: createCredentialsData,
    })

    await prisma.pendingTransactions.delete({
      where: {
        transaction_hash: txHash,
      },
    })

    res.status(200).json({
      status: ApiResponseStatus.success,
      data: { credentials: createCredentialsData }, /// valid credentials
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
  const session = await getSession({ req: { headers: req.headers } })
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
