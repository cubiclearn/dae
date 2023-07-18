import type { NextApiRequest, NextApiResponse } from 'next'
import { getSession } from 'next-auth/react'
import { CredentialsBurnableAbi, CredentialsFactoryAbi } from '@dae/abi'
import { prisma } from '@dae/database'
import { Address, createPublicClient } from 'viem'
import { getChainFromId } from '../../../../lib/functions'
import { getCourse } from '../../../../lib/api'
import { config as TransportConfig } from '@dae/viem-config'
import { decodeEventLog } from 'viem'
import type { Course, Roles } from '@dae/database'
import { FactoryContractAddress } from '@dae/chains'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const session = await getSession({ req })
  if (!session) {
    res.status(401).json({ message: 'You are unauthorized' })
    return
  }

  if (req.method === 'GET') {
    const { chainId, address } = req.query as {
      chainId: string
      address: string
    }

    try {
      const data = await getCourse(address, parseInt(chainId))
      res.status(200).json(data)
    } catch (e) {
      res.status(500).json({ message: e.message || 'Internal Server Error' })
    }
  } else if (req.method === 'POST') {
    const { txHash, chainId } = req.body

    const client = createPublicClient({
      chain: getChainFromId[chainId],
      transport: TransportConfig[chainId]?.transport,
    })

    const factoryAddress = FactoryContractAddress[
      chainId as keyof FactoryContractAddress
    ] as Address

    try {
      const transaction = await client.waitForTransactionReceipt({
        hash: txHash,
      })

      const txLogs = await client.getTransactionReceipt({ hash: txHash })

      const txKarmaControlLog = txLogs.logs.find(
        (log) => log.address === factoryAddress,
      )

      if (!txKarmaControlLog) {
        throw new Error('Transaction log not found')
      }

      const txLogsDecoded = decodeEventLog({
        abi: CredentialsFactoryAbi,
        data: txKarmaControlLog.data,
        topics: txKarmaControlLog.topics,
      })

      const contractAddress = txLogs.logs[0].address

      const [symbol, baseURI] = await Promise.all([
        client.readContract({
          address: contractAddress,
          abi: CredentialsBurnableAbi,
          functionName: 'symbol',
        }),
        client.readContract({
          address: contractAddress,
          abi: CredentialsBurnableAbi,
          functionName: 'baseURI',
        }),
      ])

      const timestamp = (
        await client.getBlock({ blockNumber: transaction.blockNumber! })
      ).timestamp

      const metadataResponse = await fetch(baseURI)

      if (!metadataResponse.ok) {
        throw new Error(metadataResponse.statusText)
      }

      const jsonMetadata = await metadataResponse.json()

      if (
        !jsonMetadata ||
        !jsonMetadata.name ||
        !jsonMetadata.description ||
        !jsonMetadata.image ||
        !jsonMetadata['snapshot-ens']
      ) {
        throw new Error('Wrong metadata structure')
      }

      const courseData = {
        address: contractAddress.toLowerCase(),
        name: jsonMetadata.name,
        description: jsonMetadata.description,
        access_url: jsonMetadata.access_url,
        image_url: jsonMetadata.image,
        website_url: jsonMetadata.website,
        symbol: symbol,
        ipfs_metadata: baseURI,
        maxSupply: 100,
        burnable: false,
        timestamp: Number(timestamp),
        chainId: Number(chainId),
        karma_access_control_address:
          txLogsDecoded.args.karmaAccessControl.toLowerCase(),
        snapshot_space_ens: jsonMetadata['snapshot-ens'],
      } as Course

      await prisma.course.create({
        data: courseData,
      })

      await prisma.roles.create({
        data: {
          courseAddress: contractAddress.toLowerCase(),
          userAddress: transaction.from,
          role: 'MAGISTER',
          chainId: Number(chainId),
        } as Roles,
      })

      res.status(200).json({ message: 'OK!', data: courseData })
    } catch (e) {
      console.error(e)
      res.status(500).json({ message: e.message || 'Internal Server Error' })
    }
  } else {
    res.status(400).json({ message: 'Invalid HTTP method' })
  }
}
