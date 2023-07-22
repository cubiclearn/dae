import type { NextApiRequest, NextApiResponse } from 'next'
import { getSession } from 'next-auth/react'
import { getUserCourseCredentials } from '../../../../../lib/api'
import { Address } from 'viem'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const session = await getSession({ req })

  if (!session) {
    res.status(401).json({ message: 'Unauthenticated' })
    return
  }

  if (req.method === 'GET') {
    const { chainId, courseAddress, userAddress } = req.query as {
      chainId: string
      courseAddress: Address
      userAddress: Address
    }

    if (!chainId || !courseAddress || !userAddress) {
      res.status(401).json({ message: 'Bad request' })
      return
    }

    const credentials = await getUserCourseCredentials(
      userAddress,
      courseAddress,
      parseInt(chainId),
    )

    res.status(200).json({ credentials: credentials })
  } else {
    res.status(400).json({ message: 'This method is not supported' })
  }
}
