import 'react-toastify/dist/ReactToastify.css'
import '@rainbow-me/rainbowkit/styles.css'

import React from 'react'
import {AppProps} from 'next/app'
import {SessionProvider} from 'next-auth/react'
import {ChakraProvider} from '@chakra-ui/react'
import {RainbowKitSiweNextAuthProvider} from '@rainbow-me/rainbowkit-siwe-next-auth'
import {getDefaultWallets, RainbowKitProvider} from '@rainbow-me/rainbowkit'
import {WagmiConfig, createConfig, configureChains} from 'wagmi'
import {sepolia, foundry} from 'wagmi/chains'
import {publicProvider} from 'wagmi/providers/public'
import {Session} from 'next-auth'
import {Layout} from '@dae/ui'

const supportedChains = process.env.NODE_ENV !== 'production' ? [sepolia, foundry] : [sepolia]

export const {chains, publicClient, webSocketPublicClient} = configureChains(supportedChains, [publicProvider()])

const {connectors} = getDefaultWallets({
  appName: 'Decentralized Autonomous Education (DAE)',
  chains,
})

const config = createConfig({
  publicClient,
  webSocketPublicClient,
  connectors,
  autoConnect: true,
})

const MyApp = ({Component, pageProps}: AppProps<{session: Session}>) => {
  const AnyComponent = Component as any
  return (
    <WagmiConfig config={config}>
      <SessionProvider session={pageProps.session} refetchInterval={0}>
        <RainbowKitSiweNextAuthProvider>
          <RainbowKitProvider chains={chains} modalSize="compact">
            <ChakraProvider>
              <Layout.Base>
                <AnyComponent {...pageProps} />
              </Layout.Base>
            </ChakraProvider>
          </RainbowKitProvider>
        </RainbowKitSiweNextAuthProvider>
      </SessionProvider>
    </WagmiConfig>
  )
}

export default MyApp
