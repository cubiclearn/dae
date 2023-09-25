import type { NextApiRequest, NextApiResponse } from 'next'
import { getSession } from 'next-auth/react'
import { getCourseStudents } from '../../../../lib/api'
import { Address } from 'viem'
import { ApiResponse, ApiResponseStatus } from '@dae/types'
import { UserCredentials } from '@prisma/client'

// TypeScript enum for request methods
enum HttpMethod {
  GET = 'GET',
}

const handleGetRequest = async (
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<{ students: UserCredentials[] }>>,
) => {
  try {
    const { chainId, courseAddress } = req.query as {
      courseAddress: Address
      chainId: string
    }

    if (!chainId || !courseAddress) {
      return res.status(200).json({
        status: ApiResponseStatus.fail,
        message: 'This credential does not exists.',
      })
    }

    const students = await getCourseStudents(courseAddress, parseInt(chainId))

    return res
      .status(200)
      .json({ status: ApiResponseStatus.success, data: { students: students } })
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
  res: NextApiResponse,
) {
  // Check if req.method is defined
  if (req.method === undefined) {
    return res.status(400).json({
      status: ApiResponseStatus.fail,
      message: 'Request method is undefined',
    })
  }

  // Guard clause for unsupported request methods
  if (!(req.method in HttpMethod)) {
    return res.status(400).json({
      status: ApiResponseStatus.fail,
      message: 'This method is not supported',
    })
  }
  // Guard clause for unauthenticated requests
  const session = await getSession({ req: { headers: req.headers } })
  if (!session) {
    return res
      .status(401)
      .json({ status: ApiResponseStatus.fail, message: 'Unauthenticated' })
  }

  // Handle the respective request method
  switch (req.method) {
    case HttpMethod.GET:
      return handleGetRequest(req, res)
    default:
      return res.status(400).json({
        status: ApiResponseStatus.fail,
        message: 'This method is not supported',
      })
  }
}
