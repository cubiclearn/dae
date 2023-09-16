import type { NextApiRequest, NextApiResponse } from 'next'
import { getSession } from 'next-auth/react'
import { Address } from 'viem'
import { prisma } from '@dae/database'
import { sanitizeAddress } from '../../../../lib/functions'

enum ACTIONS {
  CREATE_COURSE = 'CREATE_COURSE',
  TRANSFER_CREDENTIALS = 'TRANSFER_CREDENTIALS',
  BURN_CREDENTIAL = 'BURN_CREDENTIAL',
}

// TypeScript enum for request methods
enum HttpMethod {
  POST = 'POST',
}

const handlePostRequest = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { txHash, chainId, action } = req.body as {
      txHash: Address
      chainId: string
      action: any
    }

    console.log('TEST')

    if (
      !chainId ||
      !txHash ||
      !action ||
      !Object.values(ACTIONS).includes(action)
    ) {
      res.status(401).json({ success: false, error: 'Bad request' })
      return
    }

    const session = await getSession({ req })

    await prisma.transactionsVerifications.create({
      data: {
        user_address: sanitizeAddress(session!.user.address as Address),
        transaction_hash: txHash,
        action: action,
        chain_id: Number(chainId),
      },
    })

    return res.status(200).json({ success: true, message: 'OK' })
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
    case HttpMethod.POST:
      return handlePostRequest(req, res)
    default:
      return res
        .status(400)
        .json({ success: false, error: 'This method is not supported' })
  }
}
