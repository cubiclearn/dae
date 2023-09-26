import { NextApiRequest, NextApiResponse } from 'next'
import { IncomingForm, Fields, Files } from 'formidable'
import { getSession } from 'next-auth/react'
import path from 'path'
import fs from 'fs'
import { ApiResponse, ApiResponseStatus } from '@dae/types'

const apiKey = process.env.INFURA_IPFS_API_KEY
const apiSecret = process.env.INFURA_IPFS_API_SECRET
const auth = Buffer.from(`${apiKey}:${apiSecret}`).toString('base64')

// TypeScript enum for request methods
enum HttpMethod {
  POST = 'POST',
}

type IpfsMetadata = {
  name: string
  description: string
  website: string
  'snapshot-ens': string
  'media-channel': string
}

const asyncParse = (
  req: NextApiRequest,
): Promise<{ fields: Fields; files: Files }> =>
  new Promise((resolve, reject) => {
    const form = new IncomingForm({ multiples: true })
    form.parse(req, (err, fields, files) => {
      if (err && err.code === 1009) {
        return reject(
          new Error(
            'Sorry, the file you uploaded exceeds the maximum allowed size of 1MB.',
          ),
        )
      }
      if (err) return reject(err)
      resolve({ fields, files })
    })
  })

const handlePostRequest = async (
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<{ metadata: IpfsMetadata }>>,
) => {
  try {
    const fData = await asyncParse(req)
    const file = fData.files.file[0]

    const filePath = path.join('/tmp', file.newFilename)
    const fileData = fs.readFileSync(filePath)

    const imageFormData = new FormData()
    const blob = new Blob([fileData], { type: file.mimetype })
    imageFormData.append('file', blob, file.originalFilename)

    const imageIPFSResponse = await fetch(
      'https://ipfs.infura.io:5001/api/v0/add',
      {
        method: 'POST',
        body: imageFormData,
        headers: {
          Authorization: `Basic ${auth}`,
        },
      },
    )

    if (!imageIPFSResponse.ok) {
      return res.status(500).json({
        status: ApiResponseStatus.error,
        message: 'Error uploading course metadata to IPFS',
      })
    }

    const ipfsData = await imageIPFSResponse.json()

    const metadataFormData = new FormData()
    metadataFormData.append(
      'data',
      JSON.stringify({
        image: `${process.env.NEXT_PUBLIC_IPFS_GATEWAY_URL}/${ipfsData.Hash}`,
        ...{
          name: fData.fields.name[0],
          description: fData.fields.description[0],
          website: fData.fields.website[0],
          'snapshot-ens': fData.fields['snapshot-ens'][0],
          'media-channel': fData.fields['media-channel'][0],
        },
      }),
    )

    const metadataIPFSResponse = await fetch(
      'https://ipfs.infura.io:5001/api/v0/add',
      {
        method: 'POST',
        body: metadataFormData,
        headers: {
          Authorization: `Basic ${auth}`,
        },
      },
    )

    if (!metadataIPFSResponse.ok) {
      return res.status(500).json({
        status: ApiResponseStatus.error,
        message: 'Error uploading course metadata to IPFS',
      })
    }

    const ipfsMetadata = await metadataIPFSResponse.json()

    res.status(200).json({
      status: ApiResponseStatus.success,
      data: { metadata: ipfsMetadata },
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
  const session = await getSession({ req })
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
