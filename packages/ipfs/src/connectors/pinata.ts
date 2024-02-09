import axios, { AxiosResponse } from 'axios'
import FormData from 'form-data'
import { IpfsConnector, IpfsUploadResult } from '../'
import { Readable } from 'stream'

export class PinataIpfsConnector
  implements IpfsConnector<Buffer | Record<string, any>>
{
  private ipfsGateway: string
  private JWT: string

  constructor(ipfsGateway: string, jwtToken: string) {
    this.ipfsGateway = ipfsGateway
    this.JWT = jwtToken
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
    let response: AxiosResponse | undefined = undefined
    const pinataMetadata = JSON.stringify({
      keyvalues: { environment: process.env.NEXT_PUBLIC_DAE_ENVIRONMENT },
      name: fileName,
    })

    if (fileContent instanceof Buffer) {
      const stream = Readable.from(fileContent)
      formData.append('file', stream, {
        filepath: fileName,
        contentType: mimeType,
      })
      formData.append('pinataMetadata', pinataMetadata)
      response = await axios.post(
        'https://api.pinata.cloud/pinning/pinFileToIPFS',
        formData,
        {
          maxBodyLength: Infinity,
          headers: {
            'Content-Type': `multipart/form-data; boundary=${formData.getBoundary()}`,
            Authorization: `Bearer ${this.JWT}`,
          },
        },
      )
    } else if (typeof fileContent === 'object') {
      response = await axios.post(
        'https://api.pinata.cloud/pinning/pinJSONToIPFS',
        JSON.stringify({
          pinataContent: fileContent,
          pinataMetadata: pinataMetadata,
        }),
        {
          headers: {
            accept: 'application/json',
            'content-type': 'application/json',
            Authorization: `Bearer ${this.JWT}`,
          },
        },
      )
    } else {
      throw new Error('File type not supported.')
    }

    if (response?.status !== 200) {
      throw Error('Error uploading files to IPFS.')
    }

    const data = response.data as {
      IpfsHash: string
      PinSize: string
      Timestamp: string
    }

    return {
      hash: data.IpfsHash,
      size: data.PinSize,
      name: fileName,
      url: `${this.ipfsGateway}/${data.IpfsHash}`,
    }
  }
}
