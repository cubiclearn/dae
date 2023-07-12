import { mainnet, sepolia, foundry } from 'viem/chains'

export const ChainId = {
  ETHEREUM: 1,
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
  [ChainId.SEPOLIA]: 'https://testnet.snapshot.org',
  [ChainId.FOUNDRY]: 'https://testnet.snapshot.org',
} as const

export type ChainSnapshotHub =
  typeof ChainSnapshotHub[keyof typeof ChainSnapshotHub]
