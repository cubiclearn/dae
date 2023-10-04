import type { NextApiRequest, NextApiResponse } from 'next'
import { getSession } from 'next-auth/react'
import { getUserCourses } from '../../../../lib/api'
import { Address } from 'viem'
import { CredentialType, UserCredentials } from '@dae/database'
import { ApiResponse, ApiResponseStatus } from '@dae/types'

// TypeScript enum for request methods
enum HttpMethod {
  GET = 'GET',
}

const handleGetRequest = async (
  req: NextApiRequest,
  res: NextApiResponse<
    ApiResponse<{
      credentials: (UserCredentials & {
        course: { name: string; description: string }
      })[]
    }>
  >,
) => {
  try {
    const { chainId, userAddress, roles, skip, limit } = req.query as {
      chainId: string
      userAddress: Address
      roles: string
      skip?: string
      limit?: string
    }

    const parsedRoles = roles.split(',') as CredentialType[]

    if (!chainId || !userAddress || !roles || parsedRoles.length === 0) {
      return res
        .status(400)
        .json({ status: ApiResponseStatus.error, message: 'Bad request.' })
    }

    const credentials = await getUserCourses(
      userAddress,
      Number(chainId),
      parsedRoles,
      Number(skip),
      Number(limit),
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
