import { mainnet, goerli, optimism, foundry, Chain } from "viem/chains";

export const getChainFromId: { [id: string]: Chain } = {
    1: mainnet,
    5: goerli,
    10: optimism,
    31337: foundry,
};
