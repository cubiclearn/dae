import type { NextApiRequest, NextApiResponse } from 'next'
import { getSession } from 'next-auth/react'
import { CredentialsBurnableAbi, CredentialsFactoryAbi } from '@dae/abi'
import { prisma } from '@dae/database'
import { Address, createPublicClient } from 'viem'
import { getChainFromId } from '../../../../lib/functions'
import { getCourse } from '../../../../lib/api'
import { config as TransportConfig } from '@dae/viem-config'
import { decodeEventLog } from 'viem'

// TypeScript enum for request methods
enum HttpMethod {
  GET = 'GET',
  POST = 'POST',
}

const handleGetRequest = async (req: NextApiRequest, res: NextApiResponse) => {
  const { chainId, address } = req.query as {
    chainId: string
    address: string
  }

  try {
    const course = await getCourse(address, parseInt(chainId))
    res.status(200).json({ success: true, data: { course: course } })
  } catch (e) {
    res
      .status(500)
      .json({ success: false, error: e.message || 'Internal Server Error' })
  }
}

const handlePostRequest = async (req: NextApiRequest, res: NextApiResponse) => {
  const { txHash, chainId } = req.body

  try {
    const client = createPublicClient({
      chain: getChainFromId[chainId],
      transport: TransportConfig[chainId]?.transport,
    })

    const transaction = await client.waitForTransactionReceipt({
      hash: txHash,
    })

    const txRecept = await client.getTransactionReceipt({ hash: txHash })

    const txFactoryLogsDecoded: any = txRecept.logs
      .map((log) => {
        try {
          return {
            address: log.address,
            ...decodeEventLog({
              abi: CredentialsFactoryAbi,
              data: log.data,
              topics: log.topics,
            }),
          }
        } catch (_e) {}
      })
      .filter((decodedLog) => decodedLog !== undefined)

    const txCredentialLogsDecoded: any = txRecept.logs
      .map((log) => {
        try {
          return {
            address: log.address,
            ...decodeEventLog({
              abi: CredentialsBurnableAbi,
              data: log.data,
              topics: log.topics,
            }),
          }
        } catch (_e) {}
      })
      .filter((decodedLog) => decodedLog !== undefined)

    const karmaAccessControlCreatedLog = txFactoryLogsDecoded.filter(
      (log: any) => log.eventName === 'KarmaAccessControlCreated',
    )[0]

    const contractAddress: Address = txCredentialLogsDecoded[0].address
    const karmaAccessControlAddress: Address =
      karmaAccessControlCreatedLog.args.karmaAccessControl

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
      throw new Error('The metadata url is incorrect')
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

    const courseData = await prisma.$transaction(
      async (prisma) => {
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
              karmaAccessControlAddress.toLowerCase(),
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
      },
      {
        maxWait: 5000, // default: 2000
        timeout: 7000, // default: 5000
      },
    )

    res.status(200).json({ success: true, data: { course: courseData } })
  } catch (e) {
    console.error(e)
    res
      .status(500)
      .json({ success: false, error: e.message || 'Internal Server Error' })
  }
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
    case HttpMethod.POST:
      return handlePostRequest(req, res)
    default:
      return res
        .status(400)
        .json({ success: false, error: 'This method is not supported' })
  }
}
