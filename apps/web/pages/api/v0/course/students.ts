import type {NextApiRequest, NextApiResponse} from 'next'
import {getSession} from 'next-auth/react'
import {CredentialsAbi} from '@dae/abi'
import {prisma} from '@dae/database'
import {createPublicClient} from 'viem'
import {getChainFromId} from '../../../../lib/functions'
import {getCourseStudents} from '../../../../lib/api'
import {config as TransportConfig} from '@dae/viem-config'
import {decodeEventLog} from 'viem'
import {CredentialTransferLog} from '@dae/types'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getSession({req})

  if (!session) {
    res.status(401).json({message: 'Unauthenticated'})
    return
  }

  if (req.method === 'GET') {
    const {chainId, studentAddress} = req.query as {
      chainId: string
      studentAddress: string
    }

    try {
      const data = await getCourseStudents(studentAddress, parseInt(chainId))
      res.status(200).json(data)
      return
    } catch (_e) {
      res.status(500).json({message: _e.message})
      return
    }
  } else if (req.method === 'POST') {
    const {chainId, txHash} = req.body as {
      chainId: string
      txHash: `0x${string}`
    }

    if (!chainId || !txHash) {
      res.status(400)
      return
    }

    const client = createPublicClient({
      chain: getChainFromId[chainId],
      transport: TransportConfig[chainId].transport,
    })

    const txRecept = await client.getTransactionReceipt({
      hash: txHash,
    })

    const txLogsDecoded = txRecept.logs.map((log) => {
      return decodeEventLog({
        abi: CredentialsAbi,
        data: log.data,
        topics: log.topics,
      })
    })

    const transferLogs = txLogsDecoded.filter((log) => log.eventName === 'Transfer') as [CredentialTransferLog]

    const createData = transferLogs.map((log) => {
      return {
        courseAddress: txRecept.to as `0x${string}`,
        studentAddress: log.args.to.toLowerCase(),
        chainId: parseInt(chainId),
      }
    })

    try {
      await prisma.courseStudents.createMany({
        data: createData,
      })
    } catch (_e) {
      console.error(_e)
      res.status(500).json({message: _e})
      return
    }

    res.status(200).json({message: 'OK'})
  } else {
    res.status(400).json({message: 'HTTP method not supported'})
  }
}
