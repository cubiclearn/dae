export * from './connectors/infura'

export type IpfsUploadResult = {
  hash: string
  size: string
  url: string
  name?: string
  timestamp?: number
}

export interface IpfsConnector {
  upload(
    fileContent: Buffer | Record<string, any>,
    mimeType?: string,
    fileName?: string,
  ): Promise<IpfsUploadResult>
}
