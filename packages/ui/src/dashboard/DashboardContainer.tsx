import { Address, useNetwork } from 'wagmi'
import { useCourseData } from '../CourseProvider'
import {
  useCourseStudents,
  useCourseStudentsKarma,
  useCourseTeachers,
} from '@dae/wagmi'
import React from 'react'
import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Box,
  Center,
  SimpleGrid,
  Spinner,
  Stack,
  Text,
} from '@chakra-ui/react'
import { DashboardBlock } from './DashboardBlock'

type DashboardContainerProps = {
  courseAddress: Address
}

const calculateStatistics = (data: number[], initialKarmaValue: number) => {
  const maxValue = Math.max(...data)
  const minValue = Math.min(...data)
  const mean = data.reduce((acc, val) => acc + val, 0) / data.length

  // Calculate median
  const sortedData = [...data].sort((a, b) => a - b)
  const mid = Math.floor(sortedData.length / 2)
  const median =
    sortedData.length % 2 === 0
      ? (sortedData[mid - 1] + sortedData[mid]) / 2
      : sortedData[mid]

  // Calculate standard deviation
  const squaredDiffs = data.map((value) => (value - mean) ** 2)
  const variance = squaredDiffs.reduce((acc, val) => acc + val, 0) / data.length
  const stdDeviation = Math.sqrt(variance)

  // Calculate Learning Return Index
  const increaseInAverageKarma = mean - initialKarmaValue
  const learningReturnIndex = increaseInAverageKarma / stdDeviation

  return {
    maxValue,
    minValue,
    mean,
    median,
    stdDeviation,
    learningReturnIndex,
  }
}

const LoadingSpinner = () => (
  <Center>
    <Spinner />
  </Center>
)

export const DashboardContainer: React.FC<DashboardContainerProps> = ({
  courseAddress,
}) => {
  const { data: courseData, isLoading: isCourseDataLoading } = useCourseData()
  const { chain } = useNetwork()
  const { data: studentsData, isLoading: isLoadingStudentsData } =
    useCourseStudents(courseAddress, chain?.id)
  const { data: teachersData, isLoading: isLoadingTeachersData } =
    useCourseTeachers(courseAddress, chain?.id)
  const {
    data: studentsKarmaData,
    error,
    isLoading: isLoadingKarmaData,
  } = useCourseStudentsKarma(
    studentsData
      ? studentsData.data?.students.map(
          (student) => student.user_address as Address,
        )
      : [],
    courseData
      ? (courseData.karma_access_control_address as Address)
      : undefined,
    chain?.id,
  )

  const isLoading =
    isCourseDataLoading ||
    isLoadingStudentsData ||
    isLoadingTeachersData ||
    isLoadingKarmaData

  if (!isLoading && courseData === undefined) {
    return (
      <Alert status="error">
        <AlertIcon />
        <Box>
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>This course does not exist</AlertDescription>
        </Box>
      </Alert>
    )
  }

  if (isLoading) {
    return <LoadingSpinner />
  }

  if (error || !studentsData?.data || !teachersData?.data) {
    return (
      <Alert status="error">
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

  const studentsLength = studentsData.data.students.length
  const teachersLength = teachersData.data.teachers.length

  const statistics = calculateStatistics(
    studentsKarmaData ?? [],
    courseData!.discipulus_base_karma,
  )

  return (
    <Stack spacing={6}>
      <Stack spacing={4}>
        <Text fontSize={'2xl'} fontWeight={'semibold'}>
          Participants
        </Text>
        <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 5 }} spacing={4}>
          <DashboardBlock title="Total teachers" value={teachersLength} isInt />
          <DashboardBlock title="Total students" value={studentsLength} isInt />
        </SimpleGrid>
      </Stack>
      <Stack spacing={4}>
        <Text fontSize={'2xl'} fontWeight={'semibold'}>
          Students Karma
        </Text>
        {studentsKarmaData ? (
          <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 5 }} spacing={4}>
            <DashboardBlock title="Max Value" value={statistics.maxValue} />
            <DashboardBlock title="Min Value" value={statistics.minValue} />
            <DashboardBlock title="Mean" value={statistics.mean} />
            <DashboardBlock title="Median" value={statistics.median} />
            <DashboardBlock
              title="Std Deviation"
              value={statistics.stdDeviation}
            />
            <DashboardBlock
              title="Learning Return Index"
              value={statistics.learningReturnIndex}
            />
          </SimpleGrid>
        ) : (
          <Alert status="warning">
            <AlertIcon />
            <Box>
              <AlertTitle>Warning</AlertTitle>
              <AlertDescription>
                Cannot calculate statistics without any student enrolled to the
                course.
              </AlertDescription>
            </Box>
          </Alert>
        )}
      </Stack>
    </Stack>
  )
}
