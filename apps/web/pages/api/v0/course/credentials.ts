import { NextApiRequest, NextApiResponse } from 'next'
import { getSession } from 'next-auth/react'
import { getCourseCredentials } from '../../../../lib/api'
import { IncomingForm, Fields, Files } from 'formidable'
import { uploadToIPFS } from '../../../../lib/ipfs'
import { prisma } from '@dae/database'
import fs from 'fs'

// TypeScript enum for request methods
enum HttpMethod {
  GET = 'GET',
  POST = 'POST',
}

const asyncParse = (
  req: NextApiRequest,
): Promise<{ fields: Fields; files: Files }> =>
  new Promise((resolve, reject) => {
    const form = new IncomingForm({
      multiples: true,
      maxFileSize: 1 * 1024 * 1024,
    })
    form.parse(req, (err, fields, files) => {
      if (err) return reject(err)
      resolve({ fields, files })
    })
  })

const handleGetRequest = async (req: NextApiRequest, res: NextApiResponse) => {
  const { chainId, address } = req.query as { chainId: string; address: string }

  if (!chainId || !address) {
    return res.status(400).json({ message: 'Bad request.' })
  }

  const credentials = await getCourseCredentials(address, parseInt(chainId, 10))

  return res.status(200).json({ credentials })
}

const handlePostRequest = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { fields, files } = await asyncParse(req)

    // Get the file data
    const { mimetype, filepath, originalFilename } = files.file[0]
    const { name, description, courseAddress, chainId } = fields

    if (!name || !description || !courseAddress || !chainId) {
      throw new Error('Error Uploading image to ipfs')
    }

    const buffer = fs.readFileSync(filepath)

    // Use the existing IPFS upload API to upload the file to IPFS
    const ipfsImageData = await uploadToIPFS(buffer, mimetype, originalFilename)

    if (!ipfsImageData.data?.Hash) {
      throw new Error('Error Uploading image to ipfs')
    }

    const imageURL = `${process.env.NEXT_PUBLIC_IPFS_GATEWAY_URL}/${ipfsImageData.data.Hash}`
    const ipfsMetadata = await uploadToIPFS(
      { name: name[0], description: description[0], image: imageURL },
      'data/json',
      '',
    )

    if (!ipfsMetadata.data?.Hash) {
      throw new Error('Error Uploading metadata to ipfs')
    }

    const metadataURL = `${process.env.NEXT_PUBLIC_IPFS_GATEWAY_URL}/${ipfsMetadata.data.Hash}`
    console.log(metadataURL)

    //Create the credential using Prisma with the obtained IPFS CID and other data
    const credential = await prisma.credential.create({
      data: {
        name: name[0],
        description: description[0],
        image_url: imageURL,
        ipfs_url: metadataURL,
        ipfs_cid: ipfsMetadata.data.Hash, // Accessing the Hash property directly from ipfsMetadata
        type: 'OTHER',
        course: {
          connect: {
            address_chain_id: {
              address: courseAddress[0] as string,
              chain_id: parseInt(chainId[0] as string),
            },
          },
        },
      },
    })

    return res.status(200).json({ credential: credential })
  } catch (err: any) {
    console.error(err)
    return res.status(500).json({ message: err.message })
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  // Check if req.method is defined
  if (req.method === undefined) {
    return res.status(400).json({ message: 'Request method is undefined' })
  }

  // Guard clause for unsupported request methods
  if (!(req.method in HttpMethod)) {
    return res.status(400).json({ message: 'This method is not supported' })
  }

  // Guard clause for unauthenticated requests
  const session = await getSession({ req })
  if (!session) {
    return res.status(401).json({ message: 'Unauthenticated' })
  }

  // Handle the respective request method
  switch (req.method) {
    case HttpMethod.GET:
      return handleGetRequest(req, res)
    case HttpMethod.POST:
      return handlePostRequest(req, res)
    default:
      return res.status(400).json({ message: 'This method is not supported' })
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
}
