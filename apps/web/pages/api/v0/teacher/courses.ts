import type { NextApiRequest, NextApiResponse } from 'next'
import { getSession } from 'next-auth/react'
import { prisma } from '@dae/database'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const session = await getSession({ req })

  if (!session) {
    res.status(401).json({ message: 'Unauthenticated' })
    return
  }

  if (req.method == 'GET') {
    const { chainId, address } = req.query as {
      chainId: string
      address: string
    }

    if (!chainId) {
      res.status(401).json({ message: 'Bad request' })
      return
    }

    const courses = await prisma.course.findMany({
      where: {
        chainId: parseInt(chainId),
        owner: address.toLowerCase(),
      },
      orderBy: [
        {
          timestamp: 'desc',
        },
      ],
    })

    res.status(200).json(courses)
  } else {
    res.status(400).json({ message: 'This method is not supported' })
  }
}
