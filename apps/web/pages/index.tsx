import { FC } from 'react'
import Head from 'next/head'
import { Center, Flex, Heading } from '@chakra-ui/react'
import { Layout } from '@dae/ui'

const Home: FC = () => {
  return (
    <>
      <Head>
        <title>Home | DAE</title>
        <meta name='description' content='Generated by create next app' />
        <meta name='viewport' content='width=device-width, initial-scale=1' />
        <link rel='icon' href='/favicon.ico' />
      </Head>
      <Layout.Page>
        <Flex
          width={'100vw'}
          height={'calc(100vh - 130px)'}
          alignContent={'center'}
          justifyContent={'center'}
        >
          <Center width={'80%'}>
            <Heading
              as='h1'
              fontSize={{ sm: '58', lg: '120' }}
              textAlign={'center'}
            >
              DECENTRALIZED AUTONOMOUS EDUCATION
            </Heading>
          </Center>
        </Flex>
      </Layout.Page>
    </>
  )
}

export default Home
