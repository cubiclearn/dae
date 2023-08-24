import React from 'react'
import { CredentialsCard } from './CredentialsCard'
import { SimpleGrid } from '@chakra-ui/react'
import {
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Box,
  Center,
  Spinner,
} from '@chakra-ui/react'
import { useCourseCredentials } from '@dae/wagmi'
import { Address, useNetwork } from 'wagmi'

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

  if (!data || data.length === 0) {
    return (
      <Alert status='info'>
        <AlertIcon />
        <Box>
          <AlertTitle>Nothing to show.</AlertTitle>
          <AlertDescription>There is no credentials to show</AlertDescription>
        </Box>
      </Alert>
    )
  }

  return (
    <SimpleGrid
      columns={{ base: 1, sm: 2, lg: 3, xl: 5 }}
      spacing={{ base: 8 }}
    >
      {data.map((credential) => (
        <CredentialsCard key={credential.ipfs_cid} data={credential} />
      ))}
    </SimpleGrid>
  )
}
