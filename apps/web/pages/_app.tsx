import '@rainbow-me/rainbowkit/styles.css'

import React from 'react'
import { AppProps } from 'next/app'
import { SessionProvider } from 'next-auth/react'
import { ChakraProvider } from '@chakra-ui/react'
import { getDefaultWallets, RainbowKitProvider } from '@rainbow-me/rainbowkit'
import { WagmiConfig, createConfig, configureChains } from 'wagmi'
import { infuraProvider } from 'wagmi/providers/infura'
import { sepolia, foundry, goerli } from 'wagmi/chains'
import { publicProvider } from 'wagmi/providers/public'
import { Session } from 'next-auth'
import { Layout } from '@dae/ui'
import {
  RainbowKitSiweNextAuthProvider,
  GetSiweMessageOptions,
} from '@rainbow-me/rainbowkit-siwe-next-auth'

import theme from '../lib/theme'

const supportedChains =
  process.env.NODE_ENV !== 'production' ? [sepolia, foundry] : [sepolia]

export const { chains, publicClient, webSocketPublicClient } = configureChains(
  [...supportedChains, goerli],
  [
    infuraProvider({
      apiKey: process.env.NEXT_PUBLIC_INFURA_API_KEY as string,
    }),
    publicProvider(),
  ],
)

const { connectors } = getDefaultWallets({
  appName: 'Decentralized Autonomous Education (DAE)',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID as string,
  chains,
})

const appInfo = {
  appName: 'Decentralized Autonomous Education (DAE)',
}

const config = createConfig({
  autoConnect: true,
  publicClient,
  webSocketPublicClient,
  connectors,
})

const getSiweMessageOptions: GetSiweMessageOptions = () => ({
  statement: 'Sign in to the Decentralized Autonomous Education (DAE) App',
})

const MyApp = ({ Component, pageProps }: AppProps<{ session: Session }>) => {
  return (
    <WagmiConfig config={config}>
      <SessionProvider session={pageProps.session} refetchInterval={0}>
        <RainbowKitSiweNextAuthProvider
          getSiweMessageOptions={getSiweMessageOptions}
        >
          <RainbowKitProvider
            appInfo={appInfo}
            chains={supportedChains}
            modalSize="compact"
          >
            <ChakraProvider
              toastOptions={{
                defaultOptions: {
                  position: 'top-right',
                },
              }}
              theme={theme}
            >
              <Layout.Base>
                <Component {...pageProps} />
              </Layout.Base>
            </ChakraProvider>
          </RainbowKitProvider>
        </RainbowKitSiweNextAuthProvider>
      </SessionProvider>
    </WagmiConfig>
  )
}

export default MyApp
