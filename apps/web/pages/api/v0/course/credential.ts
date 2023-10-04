import { NextApiRequest, NextApiResponse } from 'next'
import { getSession } from 'next-auth/react'
import { asyncParse } from '../../../../lib/functions'
import { Credential, Prisma, prisma } from '@dae/database'
import fs from 'fs'
import { sanitizeAddress } from '../../../../lib/functions'
import { Address } from 'viem'
import { getCourseCredential } from '../../../../lib/api'
import { ApiResponse, ApiResponseStatus } from '@dae/types'
import { IpfsConnector } from '../../../../lib/ipfs/client'

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
    const { name, description, courseAddress, chainId } = fields

    if (!name || !description || !courseAddress || !chainId || !files.file) {
      return res
        .status(400)
        .json({ status: ApiResponseStatus.error, message: 'Bad request.' })
    }

    const { mimetype, filepath, originalFilename } = files.file[0]

    const session = await getSession({ req: { headers: req.headers } })

    const userCredentials = await prisma.userCredentials.findMany({
      where: {
        user_address: sanitizeAddress(session!.user.address as Address),
        course_address: sanitizeAddress(courseAddress[0] as Address),
        course_chain_id: parseInt(chainId[0] as string),
        credential: {
          OR: [{ type: 'ADMIN' }, { type: 'MAGISTER' }],
        },
      },
    })

    if (userCredentials.length === 0) {
      return res
        .status(401)
        .json({ status: ApiResponseStatus.error, message: 'Unauthorized' })
    }

    const buffer = fs.readFileSync(filepath)

    const ipfsCredentialImageData = await IpfsConnector.upload(
      buffer,
      mimetype ?? '',
      originalFilename ?? '',
    )

    const ipfsCredentialMetadata = await IpfsConnector.upload(
      {
        name: name[0],
        description: description[0],
        image: ipfsCredentialImageData.url,
      },
      'data/json',
      '',
    )

    //Create the credential using Prisma with the obtained IPFS CID and other data
    const credential = await prisma.credential.create({
      data: {
        name: name[0],
        description: description[0],
        image_url: ipfsCredentialImageData.url,
        ipfs_url: ipfsCredentialMetadata.url,
        ipfs_cid: ipfsCredentialMetadata.hash, // Accessing the Hash property directly from ipfsMetadata
        type: 'OTHER',
        course: {
          connect: {
            address_chain_id: {
              address: sanitizeAddress(courseAddress[0] as Address),
              chain_id: parseInt(chainId[0] as string),
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
    const { credentialCid, courseAddress, chainId } = req.query

    if (!credentialCid || !courseAddress || !chainId) {
      return res
        .status(400)
        .json({ status: ApiResponseStatus.error, message: 'Bad request.' })
    }

    const session = await getSession({ req: { headers: req.headers } })

    const userCredentials = await prisma.userCredentials.findMany({
      where: {
        user_address: sanitizeAddress(session!.user.address as Address),
        course_address: sanitizeAddress(courseAddress as Address),
        course_chain_id: parseInt(chainId as string),
        credential: {
          OR: [{ type: 'ADMIN' }, { type: 'MAGISTER' }],
        },
      },
    })

    if (userCredentials.length === 0) {
      return res
        .status(401)
        .json({ status: ApiResponseStatus.error, message: 'Unauthorized' })
    }

    await prisma.credential.delete({
      where: {
        course_address_course_chain_id_ipfs_cid: {
          course_address: courseAddress as Address,
          ipfs_cid: credentialCid as string,
          course_chain_id: parseInt(chainId as string),
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
