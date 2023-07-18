import { NextApiRequest, NextApiResponse } from 'next'
import { IncomingForm, Fields, Files } from 'formidable'
import path from 'path'
import fs from 'fs'

const apiKey = process.env.INFURA_IPFS_API_KEY
const apiSecret = process.env.INFURA_IPFS_API_SECRET
const auth = Buffer.from(`${apiKey}:${apiSecret}`).toString('base64')

export const config = {
  api: {
    bodyParser: false,
  },
}

const asyncParse = (
  req: NextApiRequest,
): Promise<{ fields: Fields; files: Files }> =>
  new Promise((resolve, reject) => {
    const form = new IncomingForm({ multiples: true })
    form.parse(req, (err, fields, files) => {
      if (err) return reject(err)
      resolve({ fields, files })
    })
  })

function mapArraysToJSON(keys: string[], values: string[]) {
  if (keys.length !== values.length) {
    throw new Error('Arrays must have the same length')
  }

  var result = {}

  for (var i = 0; i < keys.length; i++) {
    result[keys[i].toLowerCase()] = values[i]
  }

  return result
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    const fData = await asyncParse(req)
    console.log(fData)
    const file = fData.files.file[0]

    const filePath = path.join('/tmp', file['newFilename'])
    const fileData = fs.readFileSync(filePath)

    const imageFormData = new FormData()
    const blob = new Blob([fileData], { type: file['mimetype'] })
    imageFormData.append('file', blob, file['originalFilename'])

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

    const ipfsData = await imageIPFSResponse.json()
    const metadata = mapArraysToJSON(
      fData.fields['keys'] as string[],
      fData.fields['values'] as string[],
    )

    const metadataFormData = new FormData()
    metadataFormData.append(
      'data',
      JSON.stringify({
        image: `${process.env.NEXT_PUBLIC_IPFS_GATEWAY_URL}/${ipfsData['Hash']}`,
        ...metadata,
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

    const ipfsMetadata = await metadataIPFSResponse.json()

    res.status(200).json(ipfsMetadata)
  } catch (err: any) {
    console.log(err)
    return res.status(500).json({ error: `Error: ${err}`, success: false })
  }
}
