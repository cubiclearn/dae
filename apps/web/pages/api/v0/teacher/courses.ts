import type {NextApiRequest, NextApiResponse} from 'next'
import {getSession} from 'next-auth/react'
import {getTeacherCourses} from '../../../../lib/api'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getSession({req})

  if (!session) {
    res.status(401).json({message: 'Unauthenticated'})
    return
  }

  if (req.method === 'GET') {
    const {chainId, ownerAddress} = req.query as {
      chainId: string
      ownerAddress: string
    }

    if (!chainId) {
      res.status(401).json({message: 'Bad request'})
      return
    }

    const courses = await getTeacherCourses(ownerAddress.toLowerCase(), parseInt(chainId))

    res.status(200).json(courses)
  } else {
    res.status(400).json({message: 'This method is not supported'})
  }
}
