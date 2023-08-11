import type { NextApiRequest, NextApiResponse } from 'next'
import { getSession } from 'next-auth/react'
import { getUserCourses } from '../../../../lib/api'
import { Address } from 'viem'
import { Course } from '@dae/database'

// TypeScript enum for request methods
enum HttpMethod {
  GET = 'GET',
}

const handleGetRequest = async (req: NextApiRequest, res: NextApiResponse) => {
  const { chainId, userAddress, role } = req.query as {
    chainId: string
    userAddress: Address
    role: 'EDUCATOR' | 'DISCIPULUS'
  }

  if (!chainId || !userAddress || !role) {
    res.status(401).json({ success: false, error: 'Bad request' })
    return
  }

  let courses: Course[]

  if (role === 'DISCIPULUS') {
    courses = await getUserCourses(userAddress, parseInt(chainId), 'DISCIPULUS')
  } else if (role === 'EDUCATOR') {
    courses = await getUserCourses(userAddress, parseInt(chainId), 'EDUCATOR')
  } else {
    res.status(401).json({ success: false, error: 'Bad request' })
    return
  }

  res.status(200).json({ success: true, data: { courses: courses } })
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
    case HttpMethod.GET:
      return handleGetRequest(req, res)
    default:
      return res
        .status(400)
        .json({ success: false, error: 'This method is not supported' })
  }
}
