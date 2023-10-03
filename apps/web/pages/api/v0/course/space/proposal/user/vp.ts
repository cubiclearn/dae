import { NextApiRequest, NextApiResponse } from 'next'
import { getSession } from 'next-auth/react'
import { ApiResponse, ApiResponseStatus } from '@dae/types'
import { GraphQLClient } from 'graphql-request'
import { ChainSnapshotHub } from '@dae/chains'
import { USER_VOTING_POWER_QUERY } from '@dae/snapshot'
import { Address } from 'viem'
import { getCourse } from '../../../../../../../lib/api'

// TypeScript enum for request methods
enum HttpMethod {
  GET = 'GET',
}

const handleGetRequest = async (
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<USER_VOTING_POWER_QUERY>>,
) => {
  try {
    const { courseAddress, proposalId, userAddress, chainId } = req.query as {
      courseAddress: Address
      proposalId: string
      userAddress: Address
      chainId: string
    }

    if (!courseAddress || !proposalId || !userAddress || !chainId) {
      return res
        .status(400)
        .json({ status: ApiResponseStatus.error, message: 'Bad request.' })
    }
    const hub = ChainSnapshotHub[chainId]

    const course = await getCourse(courseAddress, Number(chainId))

    if (!course) {
      throw new Error('Course does not exists.')
    }

    const client = new GraphQLClient(`${hub}/graphql`, {
      headers: process.env.SNAPSHOT_API_KEY
        ? { 'x-api-key': process.env.SNAPSHOT_API_KEY }
        : {},
    })

    const proposal = await client.request<USER_VOTING_POWER_QUERY>(
      USER_VOTING_POWER_QUERY,
      {
        spaceId: course.snapshot_space_ens,
        proposalId: proposalId,
        userAddress: userAddress,
      },
    )

    return res.status(200).json({
      status: ApiResponseStatus.success,
      data: proposal,
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
