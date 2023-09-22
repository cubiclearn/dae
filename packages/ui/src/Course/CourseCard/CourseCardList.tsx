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

  const { data, error, isLoading } = useUserCourses(
    address as Address | undefined,
    chain?.id,
    role,
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

  if (!data || data.courses.length === 0) {
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

  return (
    <SimpleGrid
      columns={{ sm: 1, md: 2, lg: 3, xl: 5 }}
      spacing={{ sm: 0, md: 8 }}
    >
      {data.courses.map((course) => (
        <CourseCard key={course.address} data={course} />
      ))}
    </SimpleGrid>
  )
}
