import { NextApiRequest, NextApiResponse } from 'next'
import { getSession } from 'next-auth/react'
import { Address } from 'viem'
import { ApiResponse, ApiResponseStatus } from '@dae/types'
import { GraphQLClient } from 'graphql-request'
import { ChainSnapshotHub } from '@dae/chains'
import { PROPOSALS_QUERY } from '@dae/snapshot'
import { getCourse } from '../../../../../lib/api'

// TypeScript enum for request methods
enum HttpMethod {
  GET = 'GET',
}

const handleGetRequest = async (
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<PROPOSALS_QUERY>>,
) => {
  try {
    const { chainId, courseAddress, status, skip, limit } = req.query as {
      chainId: string
      courseAddress: Address
      status: 'active' | 'closed'
      skip?: string
      limit?: string
    }

    if (
      !chainId ||
      !courseAddress ||
      (status !== 'active' && status !== 'closed')
    ) {
      return res
        .status(400)
        .json({ status: ApiResponseStatus.error, message: 'Bad request.' })
    }
    const hub = ChainSnapshotHub[chainId]

    const client = new GraphQLClient(`${hub}/graphql`, {
      headers: process.env.SNAPSHOT_API_KEY
        ? { 'x-api-key': process.env.SNAPSHOT_API_KEY }
        : {},
    })

    const course = await getCourse(courseAddress, Number(chainId))

    if (!course) {
      throw new Error('Course does not exists.')
    }

    const proposals = await client.request<PROPOSALS_QUERY>(PROPOSALS_QUERY, {
      spaceId: course.snapshot_space_ens,
      state: status,
      start: course.timestamp,
      skip: Number(skip),
      limit: Number(limit),
    })

    return res.status(200).json({
      status: ApiResponseStatus.success,
      data: proposals,
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
