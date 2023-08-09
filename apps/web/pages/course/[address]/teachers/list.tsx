import Head from 'next/head'
import { Layout } from '@dae/ui'
import { Stack } from '@chakra-ui/react'
import { useRouter } from 'next/router'
import { TeachersRowList } from '@dae/ui'
import { Address } from 'wagmi'

export default function StudentsList() {
  const router = useRouter()
  const courseAddress = router.query.address as Address

  return (
    <>
      <Head>
        <title>Teachers | DAE</title>
        <meta name='description' content='Generated by create next app' />
        <meta name='viewport' content='width=device-width, initial-scale=1' />
        <link rel='icon' href='/favicon.ico' />
      </Head>
      <Layout.Course heading='Course teachers'>
        <Stack spacing={8}>
          <TeachersRowList courseAddress={courseAddress} />
        </Stack>
      </Layout.Course>
    </>
  )
}