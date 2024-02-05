export * from './connectors/infura'
export * from './connectors/pinata'

export type IpfsUploadResult = {
  hash: string
  size: string
  url: string
  name?: string
  timestamp?: number
}

export interface IpfsConnector<T> {
  upload({
    fileContent,
    mimeType,
    fileName,
  }: {
    fileContent: T
    mimeType?: string
    fileName?: string
  }): Promise<IpfsUploadResult>
}
