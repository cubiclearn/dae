import React from 'react'
import { CourseCard } from './CourseCard'
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
import { useUserCourses } from '@dae/wagmi'
import { Address, useAccount, useNetwork } from 'wagmi'

interface CourseCardListProps {
  role: 'EDUCATOR' | 'DISCIPULUS'
}

export const CourseCardList: React.FC<CourseCardListProps> = ({ role }) => {
  const { chain } = useNetwork()
  const { address } = useAccount()

  const {
    data: response,
    error,
    isLoading,
  } = useUserCourses(
    address ? (address as Address) : undefined,
    chain ? chain.id : undefined,
    role,
  )

  if (!chain || !chain.id || !address) {
    return (
      <Alert status='error'>
        <AlertIcon />
        <Box>
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            You are not connected to Web3. Please connect your wallet before
            proceeding.
          </AlertDescription>
        </Box>
      </Alert>
    )
  }

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

  if (!response || response.data.courses.length === 0) {
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
      {response.data.courses.map((course) => (
        <CourseCard key={course.address} data={course} />
      ))}
    </SimpleGrid>
  )
}
