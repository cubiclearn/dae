import Head from 'next/head'
import { Layout } from '@dae/ui'
import { Box, Heading, Stack, Text, Link, Image } from '@chakra-ui/react'
import { useRouter } from 'next/router'
import NextLink from 'next/link'
import { GetServerSideProps } from 'next'
import { getCourse } from '../../../lib/api'

export default function CoursePage({ course }: any) {
  const { query } = useRouter()
  const address = query.address as string | undefined

  return (
    <>
      <Head>
        <title>{`Course Info | ${address}`}</title>
        <meta name='description' content='Generated by create next app' />
        <meta name='viewport' content='width=device-width, initial-scale=1' />
        <link rel='icon' href='/favicon.ico' />
      </Head>
      <Layout.Course heading='About the course'>
        <Stack spacing={4}>
          <Box>
            <Heading as='h2' fontWeight='semibold' fontSize={'xl'}>
              Address:
            </Heading>
            <Text>{address}</Text>
          </Box>
          <Box boxSize='sm'>
            <Image
              src={course.image_url}
              alt='Green double couch with wooden legs'
              borderRadius='lg'
            />
          </Box>
          <Box>
            <Heading as='h2' fontWeight='semibold' fontSize={'2xl'}>
              Title:
            </Heading>
            <Text>{course.name}</Text>
          </Box>
          <Box>
            <Heading as='h2' fontWeight='semibold' fontSize={'2xl'}>
              Description:
            </Heading>
            <Text>{course.description}</Text>
          </Box>
          <Box>
            <Heading as='h3' fontWeight='semibold' fontSize={'2xl'}>
              Social:
            </Heading>
            <Box>
              Website:{' '}
              <Link href={course.website_url} as={NextLink} target='_blank'>
                {course.website_url}
              </Link>
            </Box>
            <Box>
              Access Link:{' '}
              <Link href={course.access_url} as={NextLink} target='_blank'>
                {course.access_url}
              </Link>
            </Box>
          </Box>
        </Stack>
      </Layout.Course>
    </>
  )
}

export const getServerSideProps: GetServerSideProps<{ course: any }> = async (
  context,
) => {
  const { address, chainId } = context.query as {
    address: string
    chainId: string
  }

  if (!address || !chainId) {
    return {
      redirect: {
        permanent: false,
        destination: '/',
      },
      props: {},
    }
  }

  try {
    const data = await getCourse(address, parseInt(chainId))
    return {
      props: {
        course: data,
      },
    }
  } catch (e) {
    return {
      notFound: true,
    }
  }
}
