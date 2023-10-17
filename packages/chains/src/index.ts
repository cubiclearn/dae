import { mainnet, sepolia, foundry, goerli } from 'viem/chains'

export const DefaultChain = sepolia

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

export const ChainToSnapshotChain = {
  [ChainId.ETHEREUM]: mainnet,
  [ChainId.SEPOLIA]: goerli,
  [ChainId.FOUNDRY]: goerli,
} as const

export type ChainToSnapshotChain =
  typeof ChainToSnapshotChain[keyof typeof ChainToSnapshotChain]

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
  [ChainId.SEPOLIA]: '0xf39ff550e518c9044e6235e3708141fc28dbd4bb',
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
