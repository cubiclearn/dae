import Head from 'next/head'
import { CourseCredentialsList, Layout, Web3SafeContainer } from '@dae/ui'
import { CustomLink } from '@dae/ui'
import { Stack, Tabs, TabList, Tab } from '@chakra-ui/react'
import { useRouter } from 'next/router'
import { Address } from 'viem'

export default function Teaching() {
  const router = useRouter()
  const courseAddress = router.query.address as Address

  return (
    <>
      <Head>
        <title>Credentials | DAE</title>
        <meta name='description' content='Generated by create next app' />
        <meta name='viewport' content='width=device-width, initial-scale=1' />
        <link rel='icon' href='/favicon.ico' />
      </Head>
      <Layout.Course heading='Credentials'>
        <Stack spacing={8}>
          <Tabs defaultIndex={0}>
            <TabList>
              <CustomLink href={`/course/${courseAddress}/credentials/list`}>
                <Tab>Course Credentials</Tab>
              </CustomLink>
              <CustomLink href={`/course/${courseAddress}/credentials/granted`}>
                <Tab>My Credentials</Tab>
              </CustomLink>
              <CustomLink href={`/course/${courseAddress}/credentials/create`}>
                <Tab>Create</Tab>
              </CustomLink>
              <CustomLink
                href={`/course/${courseAddress}/credentials/transfer`}
              >
                <Tab>Transfer</Tab>
              </CustomLink>
            </TabList>
          </Tabs>
          <Web3SafeContainer>
            <CourseCredentialsList courseAddress={courseAddress} />
          </Web3SafeContainer>
        </Stack>
      </Layout.Course>
    </>
  )
}
