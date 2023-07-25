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
import { useUserCourseCredentials } from '@dae/wagmi'
import { Address, useNetwork } from 'wagmi'

interface CourseCardListProps {
  courseAddress: Address
}

export const MyCredentialsList: React.FC<CourseCardListProps> = ({
  courseAddress,
}) => {
  const { chain } = useNetwork()

  const { data, error, isLoading } = useUserCourseCredentials(
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
          <AlertDescription>There is no course to show</AlertDescription>
        </Box>
      </Alert>
    )
  }

  return (
    <SimpleGrid
      columns={{ sm: 1, md: 2, lg: 3, xl: 5 }}
      spacing={{ sm: 0, md: 8 }}
    >
      {data.map((credential) => (
        <CredentialsCard key={credential.ipfs_cid} data={credential} />
      ))}
    </SimpleGrid>
  )
}
