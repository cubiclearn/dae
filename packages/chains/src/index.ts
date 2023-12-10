import { mainnet, sepolia, foundry } from 'viem/chains'

export const ChainId = {
  ETHEREUM: 1,
  GOERLI: 5,
  FOUNDRY: 31337,
  SEPOLIA: 11155111,
} as const

export type ChainId = typeof ChainId[keyof typeof ChainId]

export const ChainKey = {
  [ChainId.ETHEREUM]: mainnet,
  [ChainId.SEPOLIA]: sepolia,
  [ChainId.FOUNDRY]: foundry,
} as const

export type ChainKey = typeof ChainKey[keyof typeof ChainKey]

export const DefaultChain = sepolia

export const ChainSnapshotHub = {
  [ChainId.ETHEREUM]: 'https://hub.snapshot.org',
  [ChainId.SEPOLIA]: 'https://testnet.hub.snapshot.org',
  [ChainId.FOUNDRY]: 'https://testnet.hub.snapshot.org',
} as const

export type ChainSnapshotHub =
  typeof ChainSnapshotHub[keyof typeof ChainSnapshotHub]

export const ChainSnapshotWebsite = {
  [ChainId.ETHEREUM]: 'https://snapshot.org',
  [ChainId.SEPOLIA]: 'https://demo.snapshot.org',
  [ChainId.FOUNDRY]: 'https://demo.snapshot.org',
} as const

export type ChainSnapshotWebsite =
  typeof ChainSnapshotWebsite[keyof typeof ChainSnapshotWebsite]

export const FactoryContractAddress = {
  [ChainId.ETHEREUM]: '',
  [ChainId.SEPOLIA]: '0xb6c59c1538d362d9495f1564629ae2b59f0532af',
  [ChainId.FOUNDRY]: process.env.NEXT_PUBLIC_FOUNDRY_FACTORY_CONTRACT_ADDRESS,
} as const

export type FactoryContractAddress =
  typeof FactoryContractAddress[keyof typeof FactoryContractAddress]

export const ChainBlockExplorer = {
  [ChainId.ETHEREUM]: 'https://etherscan.io',
  [ChainId.SEPOLIA]: 'https://sepolia.etherscan.io',
  [ChainId.FOUNDRY]: process.env.NEXT_PUBLIC_FOUNDRY_BLOCK_EXPLORER_URL,
} as const

export type ChainBlockExplorer =
  typeof ChainBlockExplorer[keyof typeof ChainBlockExplorer]
