import type { NextApiRequest, NextApiResponse } from 'next'
import { getSession } from 'next-auth/react'
import { getCourseTeachers } from '../../../../lib/api'
import { Address } from 'viem'

// TypeScript enum for request methods
enum HttpMethod {
  GET = 'GET',
}

const handleGetRequest = async (req: NextApiRequest, res: NextApiResponse) => {
  const { chainId, courseAddress } = req.query as {
    courseAddress: Address
    chainId: string
  }

  if (!chainId || !courseAddress) {
    res.status(401).json({ success: false, error: 'Bad request' })
    return
  }

  const teachers = await getCourseTeachers(courseAddress, parseInt(chainId))

  res.status(200).json({ success: true, data: { teachers: teachers } })
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
