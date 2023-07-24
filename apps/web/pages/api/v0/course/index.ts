import type { NextApiRequest, NextApiResponse } from 'next'
import { getSession } from 'next-auth/react'
import { CredentialsBurnableAbi, CredentialsFactoryAbi } from '@dae/abi'
import { prisma } from '@dae/database'
import { Address, createPublicClient } from 'viem'
import { getChainFromId } from '../../../../lib/functions'
import { getCourse } from '../../../../lib/api'
import { config as TransportConfig } from '@dae/viem-config'
import { decodeEventLog } from 'viem'
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
      res.status(200).json({ course: data })
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

      const courseData = await prisma.$transaction(async (prisma) => {
        const course = await prisma.course.create({
          data: {
            address: contractAddress.toLowerCase(),
            name: jsonMetadata.name,
            description: jsonMetadata.description,
            media_channel: jsonMetadata.media_channel,
            image_url: jsonMetadata.image,
            website_url: jsonMetadata.website,
            symbol: symbol,
            ipfs_metadata: baseURI,
            timestamp: Number(timestamp),
            chain_id: Number(chainId),
            karma_access_control_address:
              txLogsDecoded.args.karmaAccessControl.toLowerCase(),
            snapshot_space_ens: jsonMetadata['snapshot-ens'],
          },
        })

        const adminCredential = await prisma.credential.create({
          data: {
            name: 'Admin Credential',
            description: 'The course Admin credential',
            image_url:
              'https://dae-demo.infura-ipfs.io/ipfs/QmXibYJSXskaqS7WyXLGwy16vGASqhN75yNUp2UfMRiLkF',
            ipfs_url:
              'https://dae-demo.infura-ipfs.io/ipfs/QmbH5TB6pdQvVu5xdtbq7CDHGdPYFudr4PNqzJczW2xXMa',
            ipfs_cid: 'QmbH5TB6pdQvVu5xdtbq7CDHGdPYFudr4PNqzJczW2xXMa',
            type: 'ADMIN',
            course: {
              connect: {
                address_chain_id: {
                  address: course.address,
                  chain_id: course.chain_id,
                },
              },
            },
          },
        })

        const magisterCredential = await prisma.credential.create({
          data: {
            name: 'Magister Credential',
            description: 'The course Magister credential',
            image_url:
              'https://dae-demo.infura-ipfs.io/ipfs/QmTFVE4FoPJm2vazgVtKajbw2XSNtM2wTDrkUinxMcLbBg',
            ipfs_url:
              'https://dae-demo.infura-ipfs.io/ipfs/QmNiv7RuYbcLSbMBhmSeo755TakS45NVYA768yHeUJoSKC',
            ipfs_cid: 'QmNiv7RuYbcLSbMBhmSeo755TakS45NVYA768yHeUJoSKC',
            type: 'MAGISTER',
            course: {
              connect: {
                address_chain_id: {
                  address: course.address,
                  chain_id: course.chain_id,
                },
              },
            },
          },
        })

        await prisma.credential.create({
          data: {
            name: 'Discipulus Credential',
            description: 'The course Discipulus credential',
            image_url:
              'https://dae-demo.infura-ipfs.io/ipfs/QmUEC1WiGo9Vr3WER68u3T6mSwLexyDXj5G6WUgpVECmBY',
            ipfs_url:
              'https://dae-demo.infura-ipfs.io/ipfs/QmcV3A5RWD5ygwU71KaH8gFtjxep9BMDGeYECq9bnbyWz8',
            ipfs_cid: 'QmcV3A5RWD5ygwU71KaH8gFtjxep9BMDGeYECq9bnbyWz8',
            type: 'DISCIPULUS',
            course: {
              connect: {
                address_chain_id: {
                  address: course.address,
                  chain_id: course.chain_id,
                },
              },
            },
          },
        })

        await prisma.userCredentials.create({
          data: {
            course: {
              connect: {
                address_chain_id: {
                  address: course.address,
                  chain_id: course.chain_id,
                },
              },
            },
            user_address: transaction.from,
            credential: {
              connect: {
                id: adminCredential.id,
              },
            },
            email: '',
            discord_handle: '',
          },
        })

        await prisma.userCredentials.create({
          data: {
            course: {
              connect: {
                address_chain_id: {
                  address: course.address,
                  chain_id: course.chain_id,
                },
              },
            },
            user_address: transaction.from,
            credential: {
              connect: {
                id: magisterCredential.id,
              },
            },
            email: '',
            discord_handle: '',
          },
        })

        return course
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
