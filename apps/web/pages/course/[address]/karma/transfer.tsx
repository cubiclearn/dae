import Head from 'next/head'
import { Layout, TransferKarmaContainer } from '@dae/ui'

export default function TransferKarmaPage() {
  return (
    <>
      <Head>
        <title>Karma | DAE</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Layout.Course heading="Transfer karma">
        <TransferKarmaContainer />
      </Layout.Course>
    </>
  )
}
