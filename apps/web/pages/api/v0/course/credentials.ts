import { NextApiRequest, NextApiResponse } from 'next'
import { getSession } from 'next-auth/react'
import { getCourseCredentials } from '../../../../lib/api'
import { Address } from 'viem'
import { CredentialType } from '@prisma/client'
import { ApiResponse, ApiResponseStatus } from '@dae/types'
import { Credential } from '@dae/database'

// TypeScript enum for request methods
enum HttpMethod {
  GET = 'GET',
}

const handleGetRequest = async (
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<{ credentials: Credential[] }>>,
) => {
  try {
    const { chainId, address, type } = req.query as {
      chainId: string
      address: Address
      type: CredentialType | undefined
    }

    if (!chainId || !address) {
      return res
        .status(400)
        .json({ status: ApiResponseStatus.error, message: 'Bad request.' })
    }

    const credentials = await getCourseCredentials(
      address,
      parseInt(chainId, 10),
      type,
    )

    return res.status(200).json({
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
    default:
      return res.status(400).json({
        status: ApiResponseStatus.error,
        message: 'This method is not supported',
      })
  }
}
