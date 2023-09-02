import {
  Center,
  Spinner,
  Alert,
  AlertIcon,
  Box,
  AlertTitle,
  AlertDescription,
  SimpleGrid,
} from '@chakra-ui/react'
import React, { useMemo } from 'react'
import { DashboardBlock } from '../DashboardBlock'
import { useCourseStudents, useCourseStudentsKarma } from '@dae/wagmi'
import { Address } from 'viem'
import { Course } from '@dae/database'

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

type StatisticsSectionProps = {
  chainId: number | undefined
  courseAddress: Address | undefined
  courseData: Course | undefined
}

export const StatisticsSection: React.FC<StatisticsSectionProps> = ({
  chainId,
  courseAddress,
  courseData,
}) => {
  const {
    data: studentsData,
    isLoading: isLoadingStudentsData,
    error: errorLoadingStudents,
  } = useCourseStudents(courseAddress, chainId)

  const karmaAccessControlAddress =
    (courseData?.karma_access_control_address as Address) || undefined

  const studentsAddresses =
    studentsData?.data.students.map(
      (student) => student.user_address as Address,
    ) || []

  const {
    data: studentsKarmaData,
    error: errorLoadingKarma,
    isLoading: isLoadingKarmaData,
  } = useCourseStudentsKarma(
    studentsAddresses,
    karmaAccessControlAddress,
    chainId,
  )

  const statistics = useMemo(
    () =>
      studentsKarmaData && courseData
        ? calculateStatistics(
            studentsKarmaData,
            courseData.discipulus_base_karma,
          )
        : undefined,
    [studentsKarmaData, courseData],
  )

  if (studentsData?.data.students.length === 0) {
    return (
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
    )
  }

  if (
    isLoadingStudentsData ||
    isLoadingKarmaData ||
    (studentsData === undefined && !errorLoadingStudents) ||
    statistics === undefined
  ) {
    return (
      <Center>
        <Spinner />
      </Center>
    )
  }

  if (errorLoadingStudents || errorLoadingKarma) {
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

  return (
    <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 5 }} spacing={4}>
      <DashboardBlock title="Max Value" value={statistics.maxValue} />
      <DashboardBlock title="Min Value" value={statistics.minValue} />
      <DashboardBlock title="Mean" value={statistics.mean} />
      <DashboardBlock title="Median" value={statistics.median} />
      <DashboardBlock title="Std Deviation" value={statistics.stdDeviation} />
      <DashboardBlock
        title="Learning Return Index"
        value={statistics.learningReturnIndex}
      />
    </SimpleGrid>
  )
}
