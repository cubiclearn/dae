import "react-toastify/dist/ReactToastify.css";
import "@rainbow-me/rainbowkit/styles.css";

import React, { FC } from "react";
import { App } from "@dae/ui";
import { AppProps } from "next/app";
import { SessionProvider } from "next-auth/react";
import { ChakraProvider } from "@chakra-ui/react";
import { RainbowKitSiweNextAuthProvider } from "@rainbow-me/rainbowkit-siwe-next-auth";
import { getDefaultWallets, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { WagmiConfig, createConfig, configureChains } from "wagmi";
import { mainnet, goerli, foundry } from "wagmi/chains";
import { publicProvider } from "wagmi/providers/public";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@dae/react-query";

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

const MyApp: FC<AppProps> = ({ Component, pageProps }) => {
    const AnyComponent = Component as any;

    return (
        <WagmiConfig config={config}>
            <SessionProvider>
                <RainbowKitSiweNextAuthProvider>
                    <RainbowKitProvider chains={chains} modalSize="compact">
                        <ChakraProvider>
                            <App.Container>
                                <AnyComponent {...pageProps} />
                            </App.Container>
                        </ChakraProvider>
                    </RainbowKitProvider>
                </RainbowKitSiweNextAuthProvider>
            </SessionProvider>
        </WagmiConfig>
    );
};

export default MyApp;
