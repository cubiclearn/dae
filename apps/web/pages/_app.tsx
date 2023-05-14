import "react-toastify/dist/ReactToastify.css";
import "@rainbow-me/rainbowkit/styles.css";

import React from "react";
import { AppProps } from "next/app";
import { SessionProvider } from "next-auth/react";
import { ChakraProvider } from "@chakra-ui/react";
import { RainbowKitSiweNextAuthProvider } from "@rainbow-me/rainbowkit-siwe-next-auth";
import { getDefaultWallets, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { WagmiConfig, createConfig, configureChains } from "wagmi";
import { mainnet, goerli, foundry } from "wagmi/chains";
import { publicProvider } from "wagmi/providers/public";
import { Session } from "next-auth";

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

const MyApp = ({ Component, pageProps }: AppProps<{ session: Session }>) => {
    const AnyComponent = Component as any;

    return (
        <WagmiConfig config={config}>
            <SessionProvider session={pageProps.session} refetchInterval={0}>
                <RainbowKitSiweNextAuthProvider>
                    <RainbowKitProvider chains={chains} modalSize="compact">
                        <ChakraProvider>
                            <AnyComponent {...pageProps} />
                        </ChakraProvider>
                    </RainbowKitProvider>
                </RainbowKitSiweNextAuthProvider>
            </SessionProvider>
        </WagmiConfig>
    );
};

export default MyApp;
