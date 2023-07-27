import Head from 'next/head'
import { Layout } from '@dae/ui'
import { Stack } from '@chakra-ui/react'
import { CourseCardList } from '@dae/ui'

export default function Teaching() {
  return (
    <>
      <Head>
        <title>Teacher Courses | DAE</title>
        <meta name='description' content='Generated by create next app' />
        <meta name='viewport' content='width=device-width, initial-scale=1' />
        <link rel='icon' href='/favicon.ico' />
      </Head>
      <Layout.Profile heading='Teaching'>
        <Stack spacing={8}>
          <CourseCardList role='MAGISTER' />
        </Stack>
      </Layout.Profile>
    </>
  )
}
