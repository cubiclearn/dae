import { InfuraIpfsConnector } from '@dae/ipfs'

export const IpfsConnector = new InfuraIpfsConnector(
  process.env.INFURA_IPFS_API_KEY ?? '',
  process.env.INFURA_IPFS_API_SECRET ?? '',
  process.env.NEXT_PUBLIC_IPFS_GATEWAY_URL ?? '',
)
