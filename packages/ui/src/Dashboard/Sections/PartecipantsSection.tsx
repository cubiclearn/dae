import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Box,
  Center,
  SimpleGrid,
  Spinner,
} from '@chakra-ui/react'
import React from 'react'
import { DashboardBlock } from '../DashboardBlock'
import { Address } from 'viem'
import { useCourseStudents, useCourseTeachers } from '@dae/wagmi'

type PartecipantsSectionProps = {
  chainId: number | undefined
  courseAddress: Address | undefined
}

export const PartecipantsSection: React.FC<PartecipantsSectionProps> = ({
  chainId,
  courseAddress,
}) => {
  const {
    data: studentsData,
    isLoading: isLoadingStudentsData,
    error: errorLoadingStudents,
  } = useCourseStudents(
    { courseAddress: courseAddress, chainId: chainId },
    { fetchAll: true },
  )

  const {
    data: teachersData,
    isLoading: isLoadingTeachersData,
    error: errorLoadingTeachers,
  } = useCourseTeachers(
    { courseAddress: courseAddress, chainId: chainId },
    { fetchAll: true },
  )

  if (isLoadingStudentsData || isLoadingTeachersData) {
    return (
      <Center>
        <Spinner />
      </Center>
    )
  }

  if (
    errorLoadingStudents ||
    errorLoadingTeachers ||
    studentsData === undefined ||
    teachersData === undefined
  ) {
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

  const studentsLength = studentsData.students.length
  const teachersLength = teachersData.teachers.length

  return (
    <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 5 }} spacing={4}>
      <DashboardBlock title="Total teachers" value={teachersLength} isInt />
      <DashboardBlock title="Total students" value={studentsLength} isInt />
    </SimpleGrid>
  )
}
