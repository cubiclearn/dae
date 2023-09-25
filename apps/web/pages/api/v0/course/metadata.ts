import { NextApiRequest, NextApiResponse } from 'next'
import { asyncParse } from '../../../../lib/functions'
import { getSession } from 'next-auth/react'
import fs from 'fs'
import { ApiResponse, ApiResponseStatus } from '@dae/types'
import { IpfsUploadResult } from '@dae/ipfs'
import { IpfsConnector } from '../../../../lib/ipfs/client'

// TypeScript enum for request methods
enum HttpMethod {
  POST = 'POST',
}

const handlePostRequest = async (
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<{ metadata: IpfsUploadResult }>>,
) => {
  try {
    const { fields, files } = await asyncParse(req)
    const {
      name,
      description,
      website,
      'snapshot-ens': snapshotEns,
      'media-channel': mediaChannel,
    } = fields

    if (
      !name ||
      !description ||
      !website ||
      !snapshotEns ||
      !mediaChannel ||
      !files.file
    ) {
      return res
        .status(400)
        .json({ status: ApiResponseStatus.error, message: 'Bad request.' })
    }

    const { mimetype, filepath, originalFilename } = files.file[0]
    const buffer = fs.readFileSync(filepath)

    const ipfsCourseImageData = await IpfsConnector.upload(
      buffer,
      mimetype ?? '',
      originalFilename ?? '',
    )

    const ipfsCourseMetadata = await IpfsConnector.upload(
      {
        image: ipfsCourseImageData.url,
        name: name[0],
        description: description[0],
        website: website[0],
        'snapshot-ens': snapshotEns[0],
        'media-channel': mediaChannel[0],
      },
      'data/json',
      '',
    )

    res.status(200).json({
      status: ApiResponseStatus.success,
      data: { metadata: ipfsCourseMetadata },
    })
  } catch (error: any) {
    console.log(error)
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
    case HttpMethod.POST:
      return handlePostRequest(req, res)
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
