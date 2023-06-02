import type {NextApiRequest, NextApiResponse} from 'next'
import {getSession} from 'next-auth/react'
import {CredentialsAbi} from '@dae/abi'
import {prisma} from '@dae/database'
import {getContractAddress} from 'viem'
import {createPublicClient, http} from 'viem'
import {getChainFromId} from '../../../../lib/functions'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getSession({req})
  if (session) {
    if (req.method == 'GET') {
      const {chainId, address} = req.query as {chainId: string; address: string}
      const course = await prisma.course.findFirst({
        where: {
          address: address.toLowerCase(),
          chainId: parseInt(chainId),
        },
      })

      res.status(200).json({course: course})
    } else if (req.method == 'POST') {
      const {txHash, chainId} = req.body

      const client = createPublicClient({
        chain: getChainFromId[chainId],
        transport: http(),
      })

      const transaction = await client.getTransaction({
        hash: txHash,
      })

      const txLogs = await client.getTransactionReceipt({hash: txHash})

      // Address of the newly created Credentials contract
      const contractAddress = txLogs.logs[0].address

      //const contractAddress = '0x5067457698fd6fa1c6964e416b3f42713513b3dd'

      const owner = (await client.readContract({
        address: contractAddress,
        abi: CredentialsAbi,
        functionName: 'owner',
      })) as string
      const symbol = (await client.readContract({
        address: contractAddress,
        abi: CredentialsAbi,
        functionName: 'symbol',
      })) as string
      const maxSupply = (await client.readContract({
        address: contractAddress,
        abi: CredentialsAbi,
        functionName: 'MAX_SUPPLY',
      })) as bigint
      const baseURI = (await client.readContract({
        address: contractAddress,
        abi: CredentialsAbi,
        functionName: 'baseURI',
      })) as string

      const timestamp = (await client.getBlock({blockNumber: transaction.blockNumber!})).timestamp

      try {
        const metadata = await fetch(baseURI)

        if (!metadata.ok) {
          res.status(metadata.status).json({message: metadata.statusText})
          return
        }
        const jsonMetadata = (await metadata.json()) as any
        if (
          jsonMetadata == undefined ||
          jsonMetadata.name == undefined ||
          jsonMetadata.description == undefined ||
          jsonMetadata.access_url == undefined ||
          jsonMetadata.image == undefined ||
          jsonMetadata.website == undefined
        ) {
          throw new Error('Wrong metadata URL')
        }
        await prisma.course.create({
          data: {
            address: contractAddress.toLowerCase(),
            owner: owner.toLowerCase(),
            name: jsonMetadata.name,
            description: jsonMetadata.description,
            access_url: jsonMetadata.access_url,
            image_url: jsonMetadata.image,
            website_url: jsonMetadata.website,
            symbol: symbol,
            ipfs_metadata: baseURI,
            maxSupply: Number(maxSupply),
            burnable: false,
            timestamp: Number(timestamp),
            chainId: chainId,
          },
        })
      } catch (e) {
        res.status(400).json({message: e})
        return
      }

      res.status(200).json({message: 'OK!'})
    } else {
      res.status(400).json({message: 'You have used wrong http method'})
    }
  } else {
    res.status(401).json({message: 'You are unautorized'})
  }
}
