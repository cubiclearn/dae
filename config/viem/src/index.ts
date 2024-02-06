import { ChainId } from '@dae/chains'
import { http, PublicClientConfig } from 'viem'
import { foundry, sepolia } from 'viem/chains'

export { sepolia, foundry }

const infuraApiKey =
  process.env.INFURA_API_KEY || process.env.NEXT_PUBLIC_INFURA_API_KEY

export const config: Record<number, PublicClientConfig> = {
  //   [ChainId.ETHEREUM]: {
  //     chain: mainnet,
  //     transport: fallback(
  //       [
  //         http(`${mainnet.rpcUrls.alchemy.http}/${alchemyId}`),
  //         http('https://eth.llamarpc.com'),
  //         http('https://eth.rpc.blxrbdn.com'),
  //         http('https://virginia.rpc.blxrbdn.com'),
  //         http('https://singapore.rpc.blxrbdn.com'),
  //         http('https://uk.rpc.blxrbdn.com'),
  //         http('https://1rpc.io/eth'),
  //         http('https://ethereum.publicnode.com'),
  //         http('https://cloudflare-eth.com'),
  //       ],
  //       { rank: true }
  //     ),
  //   },
  [ChainId.FOUNDRY]: {
    chain: foundry,
    transport: http(),
  },
  [ChainId.SEPOLIA]: {
    chain: sepolia,
    transport: http(`https://sepolia.infura.io/v3/${infuraApiKey}`),
  },
} as const
