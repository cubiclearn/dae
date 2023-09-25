import type { NextApiRequest, NextApiResponse } from 'next'
import { getSession } from 'next-auth/react'
import { getUserCourses } from '../../../../lib/api'
import { Address } from 'viem'
import { Course } from '@dae/database'
import { ApiResponse, ApiResponseStatus } from '@dae/types'

// TypeScript enum for request methods
enum HttpMethod {
  GET = 'GET',
}

const handleGetRequest = async (
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<{ courses: Course[] }>>,
) => {
  try {
    const { chainId, userAddress, role } = req.query as {
      chainId: string
      userAddress: Address
      role: 'EDUCATOR' | 'DISCIPULUS'
    }

    if (!chainId || !userAddress || !role) {
      return res
        .status(400)
        .json({ status: ApiResponseStatus.error, message: 'Bad request.' })
    }

    let courses: Course[]

    if (role === 'DISCIPULUS') {
      courses = await getUserCourses(
        userAddress,
        parseInt(chainId),
        'DISCIPULUS',
      )
      return res
        .status(200)
        .json({ status: ApiResponseStatus.success, data: { courses: courses } })
    } else if (role === 'EDUCATOR') {
      courses = await getUserCourses(userAddress, parseInt(chainId), 'EDUCATOR')
      return res
        .status(200)
        .json({ status: ApiResponseStatus.success, data: { courses: courses } })
    } else {
      return res
        .status(400)
        .json({ status: ApiResponseStatus.error, message: 'Bad request.' })
    }
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
