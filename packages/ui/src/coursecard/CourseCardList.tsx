import React from 'react'
import { CourseCard } from './CourseCard'
import useSWR, { SWRResponse } from 'swr'
import type { Course } from '@dae/database'
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

interface CourseCardListProps {
  api_url: string
}

const fetcher = (url: string): Promise<Course[]> =>
  fetch(url).then((r) => r.json())

export const CourseCardList: React.FC<CourseCardListProps> = ({ api_url }) => {
  const { data, error, isLoading }: SWRResponse<Course[], any, boolean> =
    useSWR(api_url, fetcher)

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
          <AlertDescription>
            You are not currently teaching any courses
          </AlertDescription>
        </Box>
      </Alert>
    )
  }

  return (
    <SimpleGrid
      columns={{ sm: 1, md: 2, lg: 3, xl: 5 }}
      spacing={{ sm: 0, md: 8 }}
    >
      {data.map((course) => (
        <CourseCard key={course.id} data={course} />
      ))}
    </SimpleGrid>
  )
}
