import Head from 'next/head'
import { Layout } from '@dae/ui'
import { Stack } from '@chakra-ui/react'
import { MyCredentialsCardsList } from '@dae/ui'
import { useRouter } from 'next/router'
import { Address } from 'viem'

export default function Teaching() {
  const router = useRouter()
  const courseAddress = router.query.address as Address

  return (
    <>
      <Head>
        <title>Credentials | DAE</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Layout.Course heading="My credentials">
        <Stack spacing={8}>
          <MyCredentialsCardsList courseAddress={courseAddress} />
        </Stack>
      </Layout.Course>
    </>
  )
}
