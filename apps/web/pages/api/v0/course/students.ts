import type {NextApiRequest, NextApiResponse} from 'next'
import {getSession} from 'next-auth/react'
import {CredentialsAbi} from '@dae/abi'
import {prisma} from '@dae/database'
import {createPublicClient, http} from 'viem'
import {getChainFromId} from '../../../../lib/functions'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getSession({req})

  if (!session) {
    res.status(401).json({message: 'Unauthenticated'})
    return
  }

  if (req.method == 'GET') {
    const {chainId, address} = req.query as {chainId: string; address: string}
    const students = await prisma.courseStudents.findMany({
      where: {
        courseAddress: address.toLowerCase(),
        chainId: parseInt(chainId),
      },
    })
    res.status(200).json({students: students})
    return
  } else if (req.method == 'POST') {
    const {address} = req.query as {address: string}
    const {addressesToEnroll, chainId} = req.body as {chainId: string; addressesToEnroll: string[]}

    if (!addressesToEnroll || addressesToEnroll.length == 0 || !address || !chainId) {
      res.status(400)
      return
    }

    const client = createPublicClient({
      chain: getChainFromId[chainId],
      transport: http(),
    })

    const contractCallDataArray: any[] = addressesToEnroll.map((addressToEnroll: `0x${string}`) => {
      return {
        address: address,
        abi: CredentialsAbi,
        functionName: 'balanceOf',
        args: [addressToEnroll],
      }
    })

    // WHEN MULTICALL IS SUPPORTED
    //
    // const results: BigInt[] = await client.multicall({
    //     contracts: contractCallDataArray,
    // });

    // BATCH REQUEST (REMOVE IF MULTICALL)
    const results: bigint[] = await Promise.all(
      contractCallDataArray.map<Promise<bigint>>((calldata): Promise<bigint> => {
        return client.readContract(calldata) as Promise<bigint>
      })
    )

    for (let i = 0; i < addressesToEnroll.length; i++) {
      const balance: bigint = results[i]
      if (Number(balance) > 0) {
        try {
          await prisma.courseStudents.create({
            data: {
              courseAddress: address.toLowerCase(),
              studentAddress: addressesToEnroll[i].toLowerCase(),
              chainId: parseInt(chainId),
            },
          })
        } catch (e) {
          console.error(e)
        }
      }
    }
    res.status(200)
  } else {
    res.status(400).json({message: 'HTTP method not supported'})
  }
}
