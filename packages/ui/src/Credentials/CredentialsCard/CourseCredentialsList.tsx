import React, { useMemo } from 'react'
import { CredentialsCard } from './CredentialsCard'
import { SimpleGrid, Stack } from '@chakra-ui/react'
import {
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Box,
  Center,
  Spinner,
  Text,
  Link,
} from '@chakra-ui/react'
import { useCourseCredentials } from '@dae/wagmi'
import { Address, useNetwork } from 'wagmi'
import NextLink from 'next/link'

interface CourseCardListProps {
  courseAddress: Address
}

export const CourseCredentialsList: React.FC<CourseCardListProps> = ({
  courseAddress,
}) => {
  const { chain } = useNetwork()

  const { data, error, isLoading } = useCourseCredentials(
    courseAddress,
    chain?.id,
  )

  const BASE_CREDENTIALS = useMemo(
    () =>
      data !== null
        ? data.filter((credential) => credential.type !== 'OTHER')
        : [],
    [data],
  )

  const CUSTOM_CREDENTIALS = useMemo(
    () =>
      data !== null
        ? data.filter((credential) => credential.type === 'OTHER')
        : [],
    [data],
  )

  if (isLoading) {
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

  if (!data || data.length === 0) {
    return (
      <Alert status="info">
        <AlertIcon />
        <Box>
          <AlertTitle>Nothing to show.</AlertTitle>
          <AlertDescription>There is no credentials to show</AlertDescription>
        </Box>
      </Alert>
    )
  }

  return (
    <Stack spacing={8}>
      <Stack spacing={4}>
        <Text fontSize={'xl'} fontWeight={'semibold'}>
          Base
        </Text>
        <SimpleGrid
          columns={{ base: 1, sm: 2, lg: 3, xl: 5 }}
          spacing={{ base: 8 }}
        >
          {BASE_CREDENTIALS.map((credential) => (
            <CredentialsCard key={credential.ipfs_cid} data={credential} />
          ))}
        </SimpleGrid>
      </Stack>
      <Stack spacing={4}>
        <Text fontSize={'xl'} fontWeight={'semibold'}>
          Custom
        </Text>

        {CUSTOM_CREDENTIALS.length > 0 ? (
          <SimpleGrid
            columns={{ base: 1, sm: 2, lg: 3, xl: 5 }}
            spacing={{ base: 8 }}
          >
            {CUSTOM_CREDENTIALS.map((credential) => (
              <Link
                as={NextLink}
                href={`/course/${credential.course_address}/credentials/${credential.id}/info`}
                _hover={{ textDecoration: 'none' }}
                key={credential.ipfs_cid}
              >
                <CredentialsCard data={credential} />
              </Link>
            ))}
          </SimpleGrid>
        ) : (
          <Alert status="info">
            <AlertIcon />
            <Box>
              <AlertTitle>Nothing to show.</AlertTitle>
              <AlertDescription>
                You haven't created a custom credential yet.
              </AlertDescription>
            </Box>
          </Alert>
        )}
      </Stack>
    </Stack>
  )
}
