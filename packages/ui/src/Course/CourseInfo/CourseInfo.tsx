import React from 'react'
import { useCourseData } from '../../CourseProvider'
import {
  Center,
  Spinner,
  Alert,
  AlertIcon,
  Box,
  AlertTitle,
  AlertDescription,
  Link,
  Stack,
  Text,
  Image,
} from '@chakra-ui/react'
import NextLink from 'next/link'
import { ChainSnapshotWebsite } from '@dae/chains'

export const CourseInfo: React.FC<any> = () => {
  const { data, isLoading, error } = useCourseData()

  if (isLoading || (!data && !error)) {
    return (
      <Center>
        <Spinner />
      </Center>
    )
  }

  if (error) {
    return (
      <Alert status="error">
        <AlertIcon />
        <Box>
          <AlertTitle>Something went wrong.</AlertTitle>
          <AlertDescription>
            There is an error fetching your data. Try again later.
          </AlertDescription>
        </Box>
      </Alert>
    )
  }

  if (!data) {
    return (
      <Alert status="info">
        <AlertIcon />
        <Box>
          <AlertTitle>Nothing to show.</AlertTitle>
          <AlertDescription>There is no course to show</AlertDescription>
        </Box>
      </Alert>
    )
  }

  const snapshotWebsite =
    ChainSnapshotWebsite[data.chain_id as keyof typeof ChainSnapshotWebsite]

  return (
    <Box padding={8} borderRadius="xl" bg={'white'} boxShadow={'base'}>
      <Stack
        spacing={8}
        borderRadius="xl"
        direction={{ base: 'column', lg: 'row' }}
      >
        <Center width={{ base: '100%', lg: '30%' }}>
          <Image
            src={data.image_url}
            alt="Green double couch with wooden legs"
            borderRadius="lg"
            maxHeight={{ base: '300px', lg: '500px' }}
          />
        </Center>
        <Stack spacing={8} width={'100%'}>
          <Stack spacing={4}>
            <Box>
              <Text fontSize={'3xl'} fontWeight={'semibold'}>
                {data.name}
              </Text>
            </Box>
            <Box>
              <Text fontWeight={'normal'}>{data.description}</Text>
            </Box>
          </Stack>
          <Stack>
            <Text fontWeight={'semibold'}>
              Website:{' '}
              <Link
                fontWeight={'normal'}
                href={data.website_url}
                as={NextLink}
                target="_blank"
              >
                {data.website_url}
              </Link>
            </Text>
            {data.media_channel ? (
              <Text fontWeight={'semibold'}>
                Media Channel:{' '}
                <Link
                  fontWeight={'normal'}
                  href={data.media_channel}
                  as={NextLink}
                  target="_blank"
                >
                  {data.media_channel}
                </Link>
              </Text>
            ) : (
              <></>
            )}
            <Text fontWeight={'semibold'}>
              Snapshot Space:{' '}
              <Link
                href={`${snapshotWebsite}/#/${data.snapshot_space_ens}`}
                as={NextLink}
                target="_blank"
                fontWeight={'normal'}
              >
                {`${snapshotWebsite}/#/${data.snapshot_space_ens}`}
              </Link>
            </Text>
          </Stack>
        </Stack>
      </Stack>
    </Box>
  )
}
