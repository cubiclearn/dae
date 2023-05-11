"use client";

import React from "react";
import { SessionProvider } from "next-auth/react";
import { CacheProvider } from "@chakra-ui/next-js";
import { ChakraProvider } from "@chakra-ui/react";
import { RainbowKitSiweNextAuthProvider } from "@rainbow-me/rainbowkit-siwe-next-auth";
import { getDefaultWallets, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { WagmiConfig, createConfig, configureChains } from "wagmi";
import { mainnet, goerli, foundry } from "wagmi/chains";
import { publicProvider } from "wagmi/providers/public";

export const { chains, publicClient, webSocketPublicClient } = configureChains(
    [mainnet, goerli, foundry],
    [publicProvider()]
);

const { connectors } = getDefaultWallets({
    appName: "Decentralized Autonomous Education (DAE)",
    chains,
});

const config = createConfig({
    publicClient,
    webSocketPublicClient,
    connectors,
});

const Providers = ({ children }: { children: React.ReactNode }) => {
    return (
        <WagmiConfig config={config}>
            <SessionProvider>
                <RainbowKitSiweNextAuthProvider>
                    <RainbowKitProvider chains={chains} modalSize="compact">
                        <CacheProvider>
                            <ChakraProvider>{children}</ChakraProvider>
                        </CacheProvider>
                    </RainbowKitProvider>
                </RainbowKitSiweNextAuthProvider>
            </SessionProvider>
        </WagmiConfig>
    );
};

export default Providers;
