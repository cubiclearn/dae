import type { NextApiRequest, NextApiResponse } from 'next'
import { getSession } from 'next-auth/react'
import { getUserCourseCredential } from '../../../../../lib/api'
import {
  Address,
  WaitForTransactionReceiptReturnType,
  createPublicClient,
  decodeEventLog,
} from 'viem'
import { ApiResponse, ApiResponseStatus } from '@dae/types'
import { UserCredentials, prisma } from '@dae/database'
import { CredentialsBurnableAbi } from '@dae/abi'
import { ChainKey } from '@dae/chains'
import { sanitizeAddress } from '../../../../../lib/functions'
import { config as TransportConfig } from '@dae/viem-config'
import { CONFIRMATION_BLOCKS } from '@dae/constants'

// TypeScript enum for request methods
enum HttpMethod {
  GET = 'GET',
  DELETE = 'DELETE',
}

const handleGetRequest = async (
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<{ credential: UserCredentials }>>,
) => {
  try {
    const { chainId, courseAddress, userAddress, credentialCid } =
      req.query as {
        chainId: string
        courseAddress: Address
        userAddress: Address
        credentialCid: string
      }

    if (!chainId || !courseAddress || !userAddress) {
      return res
        .status(400)
        .json({ status: ApiResponseStatus.error, message: 'Bad request.' })
    }

    const credential = await getUserCourseCredential(
      credentialCid,
      courseAddress,
      parseInt(chainId),
      userAddress,
    )

    if (!credential) {
      return res.status(200).json({
        status: ApiResponseStatus.fail,
        data: null,
      })
    }

    return res.status(200).json({
      status: ApiResponseStatus.success,
      data: { credential: credential },
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

const handleDeleteRequest = async (
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<{ userCredential: UserCredentials }>>,
) => {
  try {
    const { txHash, chainId } = req.query as {
      txHash: Address
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

    const txReceipt = (await client.waitForTransactionReceipt({
      hash: txHash,
      confirmations: CONFIRMATION_BLOCKS,
    })) as WaitForTransactionReceiptReturnType

    const credentialBurnLog = txReceipt.logs[0]
    const credentialBurnLogDecoded = decodeEventLog({
      abi: CredentialsBurnableAbi,
      data: credentialBurnLog.data,
      topics: credentialBurnLog.topics,
      eventName: 'Transfer',
    })

    const deletedCredential = await prisma.userCredentials.delete({
      where: {
        user_address_course_address_credential_token_id_course_chain_id: {
          course_address: sanitizeAddress(credentialBurnLog.address),
          user_address: sanitizeAddress(credentialBurnLogDecoded.args.from),
          credential_token_id: Number(credentialBurnLogDecoded.args.tokenId),
          course_chain_id: Number(chainId),
        },
      },
    })

    await prisma.pendingTransactions.delete({
      where: {
        transaction_hash: txHash,
      },
    })

    return res.status(200).json({
      status: ApiResponseStatus.success,
      data: { userCredential: deletedCredential },
    })
  } catch (error: any) {
    console.log(error)
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
    case HttpMethod.DELETE:
      return handleDeleteRequest(req, res)
    default:
      return res.status(400).json({
        status: ApiResponseStatus.error,
        message: 'This method is not supported',
      })
  }
}
