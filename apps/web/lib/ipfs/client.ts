import { PinataIpfsConnector } from '@dae/ipfs'

export const IpfsConnector = new PinataIpfsConnector(
  process.env.NEXT_PUBLIC_IPFS_GATEWAY_URL ?? '',
  process.env.PINATA_JWT_TOKEN ?? '',
)
