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

export const ChainSnapshotWebsite = {
  [ChainId.ETHEREUM]: 'https://snapshot.org',
  [ChainId.SEPOLIA]: 'https://demo.snapshot.org',
  [ChainId.FOUNDRY]: 'https://demo.snapshot.org',
} as const

export type ChainSnapshotWebsite =
  typeof ChainSnapshotWebsite[keyof typeof ChainSnapshotWebsite]

export const FactoryContractAddress = {
  [ChainId.ETHEREUM]: '',
  [ChainId.SEPOLIA]: '0x53691a3e3adffffc414bb4bf3d8eed5f0539b503',
  [ChainId.FOUNDRY]: process.env.NEXT_PUBLIC_FOUNDRY_FACTORY_CONTRACT_ADDRESS,
} as const

export type FactoryContractAddress =
  typeof FactoryContractAddress[keyof typeof FactoryContractAddress]
