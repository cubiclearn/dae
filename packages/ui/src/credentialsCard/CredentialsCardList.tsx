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
import { Credential } from '@dae/database'
import useSWR from 'swr'

export interface CourseCredentialsResponse {
  credentials: Credential[]
}

const fetcher = async (url: string) => {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error('Failed to fetch data')
  }
  return response.json() as Promise<CourseCredentialsResponse>
}

interface CourseCardListProps {
  apiUrl: string
}

export const CredentialsCardList: React.FC<CourseCardListProps> = ({
  apiUrl,
}) => {
  const { data, error, isLoading } = useSWR<CourseCredentialsResponse>(
    apiUrl ? apiUrl : null,
    fetcher,
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

  if (!data || data.credentials.length === 0) {
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
      {data.credentials.map((credential) => (
        <CredentialsCard key={credential.ipfs_cid} data={credential} />
      ))}
    </SimpleGrid>
  )
}
