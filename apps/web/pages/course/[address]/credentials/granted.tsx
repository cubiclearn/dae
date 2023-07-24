import Head from 'next/head'
import { Layout, Web3SafeContainer } from '@dae/ui'
import { CustomLink } from '@dae/ui'
import { Stack, Tabs, TabList, Tab } from '@chakra-ui/react'
import { CredentialsCardList } from '@dae/ui'
import { useRouter } from 'next/router'
import { Address } from 'viem'
import { useAccount, useNetwork } from 'wagmi'

export default function Teaching() {
  const router = useRouter()
  const { address: userAddress } = useAccount()
  const { chain } = useNetwork()
  const courseAddress = router.query.address as Address

  return (
    <>
      <Head>
        <title>Course User Credentials | DAE</title>
        <meta name='description' content='Generated by create next app' />
        <meta name='viewport' content='width=device-width, initial-scale=1' />
        <link rel='icon' href='/favicon.ico' />
      </Head>
      <Layout.Course heading='Credentials list'>
        <Stack spacing={8}>
          <Tabs defaultIndex={1}>
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
            </TabList>
          </Tabs>
          <Web3SafeContainer>
            <CredentialsCardList
              apiUrl={`/api/v0/user/course/credentials?courseAddress=${courseAddress}&userAddress=${userAddress}&chainId=${chain?.id}`}
            />
          </Web3SafeContainer>
        </Stack>
      </Layout.Course>
    </>
  )
}