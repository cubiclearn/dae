import Head from 'next/head'
import { CredentialInfoContainer, Layout } from '@dae/ui'
import { Stack } from '@chakra-ui/react'
import { useRouter } from 'next/router'

export default function Teaching() {
  const router = useRouter()
  const credentialId =
    typeof router.query.credentialId === 'string'
      ? parseInt(router.query.credentialId)
      : undefined

  return (
    <>
      <Head>
        <title>Credential Info | DAE</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Layout.Course heading="Credential Info">
        <Stack spacing={8}>
          <CredentialInfoContainer credentialId={credentialId} />
        </Stack>
      </Layout.Course>
    </>
  )
}
