import Head from 'next/head'
import { Layout, SyncButton } from '@dae/ui'
import { Box, Stack } from '@chakra-ui/react'
import { useRouter } from 'next/router'
import { TeachersCredentialsRowList } from '@dae/ui'
import { Address } from 'wagmi'
import withCourseRoleAuth from '../../../../components/HOC/withCourseRole'

function TeachersList() {
  const router = useRouter()
  const courseAddress = router.query.address as Address

  return (
    <>
      <Head>
        <title>Teachers | DAE</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Layout.Course heading="Course teachers">
        <Stack spacing={4}>
          <Box alignSelf={'flex-end'}>
            <SyncButton />
          </Box>
          <TeachersCredentialsRowList courseAddress={courseAddress} />
        </Stack>
      </Layout.Course>
    </>
  )
}

export default withCourseRoleAuth(TeachersList, 'DISCIPULUS')
