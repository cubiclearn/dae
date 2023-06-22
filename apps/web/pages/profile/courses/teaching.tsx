import Head from 'next/head'
import { Layout } from '@dae/ui'
import { RouteWithChainId } from '@dae/ui'
import { Stack, Tabs, TabList, Tab } from '@chakra-ui/react'
import { CourseCardList } from '@dae/ui'
import { DefaultChain } from '@dae/chains'
import { useNetwork, useAccount } from 'wagmi'

export default function Teaching() {
  const { chain } = useNetwork()
  const { address } = useAccount()
  return (
    <>
      <Head>
        <title>My courses</title>
        <meta name='description' content='Generated by create next app' />
        <meta name='viewport' content='width=device-width, initial-scale=1' />
        <link rel='icon' href='/favicon.ico' />
      </Head>
      <Layout.Profile heading='Teaching'>
        <Stack spacing={8}>
          <Tabs defaultIndex={0}>
            <TabList>
              <Tab>Teaching</Tab>
              <RouteWithChainId href='/profile/courses/partecipating'>
                <Tab>Partecipating</Tab>
              </RouteWithChainId>
              <RouteWithChainId href='/profile/courses/create'>
                <Tab>Create</Tab>
              </RouteWithChainId>
            </TabList>
          </Tabs>
          <CourseCardList
            api_url={`/api/v0/teacher/courses?ownerAddress=${address}&chainId=${
              chain?.id ? chain.id : DefaultChain.id
            }`}
          />
        </Stack>
      </Layout.Profile>
    </>
  )
}
