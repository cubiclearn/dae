const apiKey = process.env.INFURA_IPFS_API_KEY
const apiSecret = process.env.INFURA_IPFS_API_SECRET
const auth = Buffer.from(`${apiKey}:${apiSecret}`).toString('base64')

interface IPFSMetadata {
  Name: string
  Hash: string
  Size: string
}

interface UploadResponse {
  success: boolean
  data?: IPFSMetadata
  error?: string
}

export async function uploadToIPFS(
  fileContent: Buffer | Record<string, any>,
  mimeType: string,
  originalFilename: string,
): Promise<UploadResponse> {
  try {
    const formData = new FormData()
    if (fileContent instanceof Buffer) {
      const blob = new Blob([fileContent as Buffer], { type: mimeType })
      formData.append('file', blob, originalFilename)
    } else if (typeof fileContent === 'object') {
      formData.append('data', JSON.stringify(fileContent))
    } else {
      throw new Error('Invalid file type.')
    }

    // Make a POST request to the IPFS upload API
    const response = await fetch('https://ipfs.infura.io:5001/api/v0/add', {
      method: 'POST',
      body: formData,
      headers: {
        Authorization: `Basic ${auth}`,
      },
    })

    // Parse the response as JSON
    const data: IPFSMetadata = await response.json()

    // Check if the upload was successful
    if (data?.Hash) {
      // Return the IPFS CID (Hash)
      return { success: true, data }
    } else {
      throw new Error('IPFS upload failed.')
    }
  } catch (error) {
    console.error(error)
    return { success: false, error: 'IPFS upload failed.' }
  }
}
