import React from 'react'
import { SimpleGrid } from '@chakra-ui/react'
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
import { Address } from 'wagmi'
import NextLink from 'next/link'
import { Card } from './Card'

interface CourseCredentialsCardsListProps {
  courseAddress: Address
}

export const CourseCredentialsCardsList: React.FC<
  CourseCredentialsCardsListProps
> = ({ courseAddress }) => {
  const { data, error, isLoading } = useCourseCredentials({
    courseAddress,
    credentialType: 'OTHER',
  })

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
          <Card
            title={credential.name}
            description={credential.description}
            image_url={credential.image_url}
          />
        </Link>
      ))}
    </SimpleGrid>
  )
}
