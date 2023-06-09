export const ChainId = {
    ETHEREUM: 1,
    FOUNDRY:31337,
    SEPOLIA: 11155111,
} as const

export type ChainId = (typeof ChainId)[keyof typeof ChainId]

export const ChainKey = {
    [ChainId.ETHEREUM]: 'ethereum',
    [ChainId.SEPOLIA]: 'sepolia',
    [ChainId.FOUNDRY]: 'foundry',
} as const

export type ChainKey = (typeof ChainKey)[keyof typeof ChainKey]