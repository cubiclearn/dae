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
} from '@chakra-ui/react'
import { useUserCourseCredentials } from '@dae/wagmi'
import { Address, useAccount, useNetwork } from 'wagmi'
import { Card } from './Card'

interface MyCredentialsCardsListProps {
  courseAddress: Address
}

export const MyCredentialsCardsList: React.FC<MyCredentialsCardsListProps> = ({
  courseAddress,
}) => {
  const { chain } = useNetwork()
  const { address } = useAccount()

  const { data, error, isLoading } = useUserCourseCredentials(
    address,
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
          <AlertDescription>There is no credential to show.</AlertDescription>
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
        <Card
          key={credential.ipfs_cid}
          title={credential.name}
          description={credential.description}
          image_url={credential.image_url}
        />
      ))}
    </SimpleGrid>
  )
}
