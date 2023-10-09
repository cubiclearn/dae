import type { NextApiRequest, NextApiResponse } from 'next'
import { getSession } from 'next-auth/react'
import { Address } from 'viem'
import { prisma } from '@dae/database'
import { sanitizeAddress } from '../../../../lib/functions'
import { ApiResponse, ApiResponseStatus } from '@dae/types'
// import { createPublicClient } from 'viem'
// import { ChainKey } from '@dae/chains'
// import { config as TransportConfig } from '@dae/viem-config'

enum ACTIONS {
  CREATE_COURSE = 'CREATE_COURSE',
  TRANSFER_CREDENTIALS = 'TRANSFER_CREDENTIALS',
  BURN_CREDENTIAL = 'BURN_CREDENTIAL',
}

// TypeScript enum for request methods
enum HttpMethod {
  POST = 'POST',
}

const handlePostRequest = async (
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<{ transaction: Address }>>,
) => {
  try {
    const { txHash, chainId, action } = req.body as {
      txHash: Address
      chainId: string
      action: any
    }

    if (
      !chainId ||
      !txHash ||
      !action ||
      !Object.values(ACTIONS).includes(action)
    ) {
      return res
        .status(400)
        .json({ status: ApiResponseStatus.error, message: 'Bad request.' })
    }

    const session = await getSession({ req: { headers: req.headers } })
    const timestamp = Date.now() / 1000

    // TODO: Test this with Vercel free(may take over 10 seconds) to check transaction contents directly from blockchain

    // const client = createPublicClient({
    //   chain: ChainKey[chainId],
    //   transport: TransportConfig[chainId]?.transport,
    // })

    // await client.waitForTransactionReceipt({
    //   hash: txHash,
    //   confirmations: 1,
    // })

    await prisma.pendingTransactions.create({
      data: {
        user_address: sanitizeAddress(session!.user.address as Address),
        transaction_hash: txHash,
        action: action,
        chain_id: Number(chainId),
        timestamp: timestamp,
      },
    })

    return res.status(200).json({
      status: ApiResponseStatus.success,
      data: { transaction: txHash },
    })
  } catch (error: any) {
    console.error(error)
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

  //Guard clause for unauthenticated requests
  const session = await getSession({ req: { headers: req.headers } })
  if (!session) {
    return res
      .status(401)
      .json({ status: ApiResponseStatus.error, message: 'Unauthenticated' })
  }

  // Handle the respective request method
  switch (req.method) {
    case HttpMethod.POST:
      return handlePostRequest(req, res)
    default:
      return res.status(400).json({
        status: ApiResponseStatus.error,
        message: 'This method is not supported',
      })
  }
}
