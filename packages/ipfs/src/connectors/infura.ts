import axios from 'axios'
import FormData from 'form-data'
import { IpfsConnector, IpfsUploadResult } from '../'

export class InfuraIpfsConnector
  implements IpfsConnector<Buffer | Record<string, any>>
{
  private apiKey: string
  private apiSecret: string
  private authToken: string
  private ipfsGateway: string

  constructor(apiKey: string, apiSecret: string, ipfsGateway: string) {
    this.apiKey = apiKey
    this.apiSecret = apiSecret
    this.authToken = Buffer.from(`${apiKey}:${apiSecret}`).toString('base64')
    this.ipfsGateway = ipfsGateway
  }

  public async upload({
    fileContent,
    fileName,
    mimeType,
  }: {
    fileContent: Buffer | Record<string, any>
    fileName: string
    mimeType: string
  }): Promise<IpfsUploadResult> {
    const formData = new FormData()

    if (fileContent instanceof Buffer) {
      formData.append('file', fileContent, {
        filename: fileName,
        contentType: mimeType,
      })
    } else if (typeof fileContent === 'object') {
      formData.append('data', JSON.stringify(fileContent))
    } else {
      throw new Error('File type not supported.')
    }

    const response = await axios.post(
      'https://ipfs.infura.io:5001/api/v0/add',
      formData,
      {
        headers: {
          Authorization: `Basic ${this.authToken}`,
          ...formData.getHeaders(),
        },
      },
    )

    if (response.status !== 200) {
      throw Error('Error uploading files to IPFS.')
    }

    const data = response.data as {
      Name: string
      Hash: string
      Size: string
    }

    return {
      hash: data.Hash,
      size: data.Size,
      name: data.Name,
      url: `${this.ipfsGateway}/${data.Hash}`,
    }
  }
}
