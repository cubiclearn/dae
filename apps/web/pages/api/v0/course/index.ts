import type { NextApiRequest, NextApiResponse } from 'next'
import { getSession } from 'next-auth/react'
import {
  CredentialsBurnableAbi,
  CredentialsFactoryAbi,
  KarmaAccessControlAbiUint64,
} from '@dae/abi'
import { Course, prisma } from '@dae/database'
import { Address, createPublicClient } from 'viem'
import { sanitizeAddress } from '../../../../lib/functions'
import { getCourse } from '../../../../lib/api'
import { config as TransportConfig } from '@dae/viem-config'
import { decodeEventLog } from 'viem'
import { ChainKey } from '@dae/chains'
import { ApiResponse, ApiResponseStatus } from '@dae/types'
import { CONFIRMATION_BLOCKS } from '@dae/constants'

// TypeScript enum for request methods
enum HttpMethod {
  GET = 'GET',
  POST = 'POST',
}

const handleGetRequest = async (
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<{ course: Course }>>,
) => {
  try {
    const { chainId, address } = req.query as {
      chainId: string
      address: Address
    }

    const course = await getCourse(address, parseInt(chainId))

    if (!course) {
      return res
        .status(200)
        .json({ status: ApiResponseStatus.fail, data: null })
    }

    return res
      .status(200)
      .json({ status: ApiResponseStatus.success, data: { course: course } })
  } catch (error) {
    console.log(error)
    return res.status(500).json({
      status: ApiResponseStatus.error,
      message:
        error.message ||
        'An error occurred while processing your request. Please try again later.',
    })
  }
}

const handlePostRequest = async (
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<{ course: Course }>>,
) => {
  const { txHash, chainId } = req.body

  try {
    const client = createPublicClient({
      chain: ChainKey[chainId],
      transport: TransportConfig[chainId]?.transport,
    })

    const transaction = await client.waitForTransactionReceipt({
      hash: txHash,
      confirmations: CONFIRMATION_BLOCKS,
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

    const [symbol, baseURI, baseMagisterKarma, baseDiscipulusKarma] =
      await Promise.all([
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
        client.readContract({
          address: karmaAccessControlAddress,
          abi: KarmaAccessControlAbiUint64,
          functionName: 'BASE_MAGISTER_KARMA',
        }),
        client.readContract({
          address: karmaAccessControlAddress,
          abi: KarmaAccessControlAbiUint64,
          functionName: 'BASE_DISCIPULUS_KARMA',
        }),
      ])

    const timestamp = (
      await client.getBlock({ blockNumber: transaction.blockNumber! })
    ).timestamp

    const metadataResponse = await fetch(baseURI)

    if (!metadataResponse.ok) {
      return res.status(500).json({
        status: ApiResponseStatus.error,
        message: 'Cannot retrieve informations from provided metadata.',
      })
    }

    const jsonMetadata = await metadataResponse.json()

    if (
      !jsonMetadata ||
      !jsonMetadata.name ||
      !jsonMetadata.description ||
      !jsonMetadata.image ||
      !jsonMetadata['snapshot-ens']
    ) {
      return res.status(500).json({
        status: ApiResponseStatus.error,
        message: 'Metadata provided is in an uncorrect format.',
      })
    }

    const courseData = await prisma.$transaction(
      async (prisma) => {
        const course = await prisma.course.create({
          data: {
            address: sanitizeAddress(contractAddress),
            name: jsonMetadata.name,
            description: jsonMetadata.description,
            media_channel: jsonMetadata['media-channel'],
            image_url: jsonMetadata.image,
            website_url: jsonMetadata.website,
            symbol: symbol,
            ipfs_metadata: baseURI,
            timestamp: Number(timestamp),
            chain_id: Number(chainId),
            karma_access_control_address: sanitizeAddress(
              karmaAccessControlAddress,
            ),
            snapshot_space_ens: jsonMetadata['snapshot-ens'],
            magister_base_karma: Number(baseMagisterKarma),
            discipulus_base_karma: Number(baseDiscipulusKarma),
          },
        })

        const [adminCredential, _magisterCredential, _discipulusCredential] =
          await Promise.all([
            prisma.credential.create({
              data: {
                name: 'Admin',
                description: 'The course Admin credential',
                image_url:
                  'https://dae-demo.infura-ipfs.io/ipfs/QmXibYJSXskaqS7WyXLGwy16vGASqhN75yNUp2UfMRiLkF',
                ipfs_url:
                  'https://dae-demo.infura-ipfs.io/ipfs/QmWNqAC88Sbti885sSbax9RK1Sfbo3akVeue5SMEhXWbjN',
                ipfs_cid: 'QmWNqAC88Sbti885sSbax9RK1Sfbo3akVeue5SMEhXWbjN',
                type: 'ADMIN',
                course: {
                  connect: {
                    address_chain_id: {
                      address: sanitizeAddress(course.address as Address),
                      chain_id: course.chain_id,
                    },
                  },
                },
              },
            }),
            prisma.credential.create({
              data: {
                name: 'Magister',
                description: 'The course Magister credential',
                image_url:
                  'https://dae-demo.infura-ipfs.io/ipfs/QmTFVE4FoPJm2vazgVtKajbw2XSNtM2wTDrkUinxMcLbBg',
                ipfs_url:
                  'https://dae-demo.infura-ipfs.io/ipfs/QmXRAu1zZ7igsNWo8egMDH3g77vFQgZHfcE2k6hoJp4JwT',
                ipfs_cid: 'QmXRAu1zZ7igsNWo8egMDH3g77vFQgZHfcE2k6hoJp4JwT',
                type: 'MAGISTER',
                course: {
                  connect: {
                    address_chain_id: {
                      address: sanitizeAddress(course.address as Address),
                      chain_id: course.chain_id,
                    },
                  },
                },
              },
            }),
            prisma.credential.create({
              data: {
                name: 'Discipulus',
                description: 'The course Discipulus credential',
                image_url:
                  'https://dae-demo.infura-ipfs.io/ipfs/QmUEC1WiGo9Vr3WER68u3T6mSwLexyDXj5G6WUgpVECmBY',
                ipfs_url:
                  'https://dae-demo.infura-ipfs.io/ipfs/QmPfKCv7ZAz8294ShRTcHft5LSM9YaDJ4NTjZisCkhFxW8',
                ipfs_cid: 'QmPfKCv7ZAz8294ShRTcHft5LSM9YaDJ4NTjZisCkhFxW8',
                type: 'DISCIPULUS',
                course: {
                  connect: {
                    address_chain_id: {
                      address: sanitizeAddress(course.address as Address),
                      chain_id: course.chain_id,
                    },
                  },
                },
              },
            }),
          ])

        await Promise.all([
          prisma.userCredentials.create({
            data: {
              course: {
                connect: {
                  address_chain_id: {
                    address: sanitizeAddress(course.address as Address),
                    chain_id: course.chain_id,
                  },
                },
              },
              user_address: sanitizeAddress(transaction.from),
              credential_token_id: -1,
              credential: {
                connect: {
                  course_address_course_chain_id_ipfs_cid: {
                    course_address: sanitizeAddress(course.address as Address),
                    ipfs_cid: adminCredential.ipfs_cid,
                    course_chain_id: parseInt(chainId as string),
                  },
                },
              },
              user_email: '',
              user_discord_handle: '',
            },
          }),
        ])

        await prisma.transactionsVerifications.update({
          where: {
            transaction_hash: txHash,
          },
          data: {
            verified: true,
          },
        })

        return course
      },
      {
        maxWait: 5000, // default: 2000
        timeout: 7000, // default: 5000
      },
    )

    return res
      .status(200)
      .json({ status: ApiResponseStatus.success, data: { course: courseData } })
  } catch (error) {
    console.error(error)
    res.status(500).json({
      status: ApiResponseStatus.error,
      message:
        error.message ||
        'An error occurred while processing your request. Please try again later.',
    })
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<any>>,
) {
  // Check if req.method is defined
  if (req.method === undefined) {
    return res.status(400).json({
      status: ApiResponseStatus.error,
      message: 'Request method is undefined',
    })
  }

  // Guard clause for unsupported request methods
  if (!(req.method in HttpMethod)) {
    return res.status(400).json({
      status: ApiResponseStatus.error,
      message: 'This method is not supported',
    })
  }

  // Guard clause for unauthenticated requests
  const session = await getSession({ req })
  if (!session) {
    return res
      .status(401)
      .json({ status: ApiResponseStatus.error, message: 'Unauthenticated' })
  }

  // Handle the respective request method
  switch (req.method) {
    case HttpMethod.GET:
      return handleGetRequest(req, res)
    case HttpMethod.POST:
      return handlePostRequest(req, res)
    default:
      return res.status(400).json({
        status: ApiResponseStatus.error,
        message: 'This method is not supported',
      })
  }
}
