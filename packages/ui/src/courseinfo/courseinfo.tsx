import React from 'react'
import { useCourseData } from '../CourseProvider'
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

  if (isLoading) {
    return (
      <Center>
        <Spinner />
      </Center>
    )
  }

  if (error) {
    return (
      <Alert status='error'>
        <AlertIcon />
        <Box>
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            There is an error fetching your data. Try again later.
          </AlertDescription>
        </Box>
      </Alert>
    )
  }

  if (!data) {
    return (
      <Alert status='info'>
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
    <Box padding={8} borderRadius='xl' bg={'white'} boxShadow={'base'}>
      <Stack
        direction={'row'}
        justifyContent={'space-between'}
        borderRadius='xl'
      >
        <Stack width={'50%'} spacing={8}>
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
            <Box>
              Website:{' '}
              <Link href={data.website_url} as={NextLink} target='_blank'>
                {data.website_url}
              </Link>
            </Box>
            {data.media_channel ? (
              <Box>
                Access Link:{' '}
                <Link href={data.media_channel} as={NextLink} target='_blank'>
                  {data.media_channel}
                </Link>
              </Box>
            ) : (
              <></>
            )}
            <Box>
              Snapshot Space:{' '}
              <Link
                href={`${snapshotWebsite}/#/${data.snapshot_space_ens}`}
                as={NextLink}
                target='_blank'
              >
                {`${snapshotWebsite}/#/${data.snapshot_space_ens}`}
              </Link>
            </Box>
          </Stack>
        </Stack>
        <Box width={'50%'} boxSize={'xs'}>
          <Image
            src={data.image_url}
            alt='Green double couch with wooden legs'
            borderRadius='lg'
          />
        </Box>
      </Stack>
    </Box>
  )
}
