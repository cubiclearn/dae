import Head from 'next/head'
import { Stack } from '@chakra-ui/react'
import { useRouter } from 'next/router'
import { Layout, TransferCredentialsFormContainer } from '@dae/ui'
import { Address } from 'viem'

export default function ProfilePage() {
  const { query } = useRouter()
  const courseAddress = query.address as Address

  return (
    <>
      <Head>
        <title>Students | DAE</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Layout.Course heading="Enroll student">
        <Stack spacing={8}>
          <TransferCredentialsFormContainer
            courseAddress={courseAddress}
            credentialType={'DISCIPULUS'}
          />
        </Stack>
      </Layout.Course>
    </>
  )
}
