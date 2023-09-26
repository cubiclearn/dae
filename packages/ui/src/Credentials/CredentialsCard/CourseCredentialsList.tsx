import React from 'react'
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
    'OTHER',
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

  if (!data || data.credentials.length === 0) {
    return (
      <Alert status="info">
        <AlertIcon />
        <Box>
          <AlertTitle>Nothing to show.</AlertTitle>
          <AlertDescription>
            You haven't created credentials yet. Click{' '}
            <Link
              fontWeight={'bold'}
              as={NextLink}
              href={`/course/${courseAddress}/credentials/create`}
              _hover={{ textDecoration: 'none' }}
            >
              here
            </Link>{' '}
            to create a new one.
          </AlertDescription>
        </Box>
      </Alert>
    )
  }

  return (
    <Stack spacing={8}>
      <Stack spacing={4}>
        <SimpleGrid
          columns={{ base: 1, sm: 2, lg: 3, xl: 5 }}
          spacing={{ base: 8 }}
        >
          {data.credentials.map((credential) => (
            <Link
              as={NextLink}
              href={`/course/${credential.course_address}/credentials/${credential.ipfs_cid}/info`}
              _hover={{ textDecoration: 'none' }}
              key={credential.ipfs_cid}
            >
              <CredentialsCard data={credential} />
            </Link>
          ))}
        </SimpleGrid>
      </Stack>
    </Stack>
  )
}
