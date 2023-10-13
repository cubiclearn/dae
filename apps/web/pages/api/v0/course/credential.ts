import { NextApiRequest, NextApiResponse } from 'next'
import { getSession } from 'next-auth/react'
import { asyncParse } from '../../../../lib/functions'
import { Credential, Prisma, prisma } from '@dae/database'
import fs from 'fs'
import { sanitizeAddress } from '../../../../lib/functions'
import { Address, createPublicClient, keccak256, toHex } from 'viem'
import { getCourseCredential } from '../../../../lib/api'
import { ApiResponse, ApiResponseStatus } from '@dae/types'
import { IpfsConnector } from '../../../../lib/ipfs/client'
import { ChainKey } from '@dae/chains'
import { config as TransportConfig } from '@dae/viem-config'
import { CredentialsBurnableAbi } from '@dae/abi'
import formidable from 'formidable'

// TypeScript enum for request methods
enum HttpMethod {
  GET = 'GET',
  POST = 'POST',
  DELETE = 'DELETE',
}

const handleGetRequest = async (
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<{ credential: Credential }>>,
) => {
  try {
    const { credentialCid, courseAddress, chainId } = req.query

    if (!credentialCid || !courseAddress || !chainId) {
      return res
        .status(400)
        .json({ status: ApiResponseStatus.error, message: 'Bad request.' })
    }

    const credential = await getCourseCredential(
      credentialCid as string,
      courseAddress as Address,
      parseInt(chainId as string),
    )

    if (!credential) {
      return res.status(200).json({
        status: ApiResponseStatus.fail,
        message: 'This credential does not exists.',
      })
    }

    return res.status(200).json({
      status: ApiResponseStatus.success,
      data: { credential: credential },
    })
  } catch (error) {
    console.error(error)
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
  res: NextApiResponse<ApiResponse<{ credential: Credential }>>,
) => {
  try {
    const { fields, files } = await asyncParse(req)

    const [name] = fields.name as string[]
    const [description] = fields.description as string[]
    const [courseAddress] = fields.courseAddress as Address[]
    const [chainId] = fields.chainId as string[]
    const [imageFile] = files.file as formidable.File[]

    if (!name || !description || !courseAddress || !chainId || !imageFile) {
      return res
        .status(400)
        .json({ status: ApiResponseStatus.error, message: 'Bad request.' })
    }

    const { mimetype, filepath, originalFilename } = imageFile

    const client = createPublicClient({
      chain: ChainKey[chainId],
      transport: TransportConfig[chainId]?.transport,
    })

    const session = await getSession({ req: { headers: req.headers } })

    const [isAdmin, isMagister] = await Promise.all([
      client.readContract({
        address: courseAddress,
        abi: CredentialsBurnableAbi,
        functionName: 'hasRole',
        args: [toHex(0, { size: 32 }), session!.user.address as Address],
      }),
      client.readContract({
        address: courseAddress,
        abi: CredentialsBurnableAbi,
        functionName: 'hasRole',
        args: [
          keccak256(toHex('MAGISTER_ROLE')),
          session!.user.address as Address,
        ],
      }),
    ])

    if (!isAdmin || !isMagister) {
      return res
        .status(401)
        .json({ status: ApiResponseStatus.error, message: 'Unauthorized' })
    }

    const credentialImageBuffer = fs.readFileSync(filepath)

    const ipfsCredentialImageData = await IpfsConnector.upload(
      credentialImageBuffer,
      mimetype ?? '',
      originalFilename ?? '',
    )

    const ipfsCredentialMetadata = await IpfsConnector.upload(
      {
        name: name,
        description: description,
        image: ipfsCredentialImageData.url,
      },
      '',
      'data/json',
    )

    const credential = await prisma.credential.create({
      data: {
        name: name,
        description: description,
        image_url: ipfsCredentialImageData.url,
        ipfs_url: ipfsCredentialMetadata.url,
        ipfs_cid: ipfsCredentialMetadata.hash,
        type: 'OTHER',
        course: {
          connect: {
            address_chain_id: {
              address: sanitizeAddress(courseAddress),
              chain_id: Number(chainId),
            },
          },
        },
      },
    })

    return res.status(200).json({
      status: ApiResponseStatus.success,
      data: { credential: credential },
    })
  } catch (error: any) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      console.error(error)
      switch (error.code) {
        case 'P2002':
          return res.status(409).json({
            status: ApiResponseStatus.error,
            message: 'A credential with the same metadata already exists.',
          })
        default:
          return res.status(400).json({
            status: ApiResponseStatus.error,
            message: 'Unknown Prisma error occurred.',
          })
      }
    } else {
      return res.status(500).json({
        status: ApiResponseStatus.error,
        message:
          error.message ||
          'An error occurred while processing your request. Please try again later.',
      })
    }
  }
}

const handleDeleteRequest = async (
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<null>>,
) => {
  try {
    const { credentialCid, courseAddress, chainId } = req.query as {
      credentialCid: string
      courseAddress: Address
      chainId: string
    }

    if (!credentialCid || !courseAddress || !chainId) {
      return res
        .status(400)
        .json({ status: ApiResponseStatus.error, message: 'Bad request.' })
    }

    const client = createPublicClient({
      chain: ChainKey[Number(chainId)],
      transport: TransportConfig[Number(chainId)]?.transport,
    })

    const session = await getSession({ req: { headers: req.headers } })

    const [isAdmin, isMagister] = await Promise.all([
      client.readContract({
        address: courseAddress,
        abi: CredentialsBurnableAbi,
        functionName: 'hasRole',
        args: [toHex(0, { size: 32 }), session!.user.address as Address],
      }),
      client.readContract({
        address: courseAddress,
        abi: CredentialsBurnableAbi,
        functionName: 'hasRole',
        args: [
          keccak256(toHex('MAGISTER_ROLE')),
          session!.user.address as Address,
        ],
      }),
    ])

    if (!isAdmin || !isMagister) {
      return res
        .status(401)
        .json({ status: ApiResponseStatus.error, message: 'Unauthorized' })
    }

    await prisma.credential.delete({
      where: {
        course_address_course_chain_id_ipfs_cid: {
          course_address: courseAddress,
          ipfs_cid: credentialCid,
          course_chain_id: Number(chainId),
        },
      },
    })

    return res
      .status(200)
      .json({ status: ApiResponseStatus.success, data: null })
  } catch (error) {
    console.error(error)
    return res.status(500).json({
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
  const session = await getSession({ req: { headers: req.headers } })
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
    case HttpMethod.DELETE:
      return handleDeleteRequest(req, res)
    default:
      return res.status(400).json({
        status: ApiResponseStatus.error,
        message: 'This method is not supported',
      })
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
}
