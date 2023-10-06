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
import { useCourseStudents, useKarmaBalances } from '@dae/wagmi'
import { Address } from 'viem'

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
  const variance =
    squaredDiffs.reduce((acc, val) => acc + val, 0) / (data.length - 1)
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
  karmaAccessControlAddress: Address | undefined
  discipulusBaseKarma: number | undefined
}

export const StatisticsSection: React.FC<StatisticsSectionProps> = ({
  chainId,
  courseAddress,
  karmaAccessControlAddress,
  discipulusBaseKarma,
}) => {
  const {
    data: studentsData,
    isLoading: isLoadingStudentsData,
    error: errorLoadingStudents,
  } = useCourseStudents(courseAddress, chainId)

  const {
    data: studentsKarmaData,
    error: errorLoadingKarma,
    isLoading: isLoadingKarmaData,
  } = useKarmaBalances({
    usersAddresses: studentsData?.students.map(
      (student) => student.user_address as Address,
    ),
    karmaAccessControlAddress: karmaAccessControlAddress,
  })

  const statistics = useMemo(
    () =>
      studentsKarmaData && discipulusBaseKarma
        ? calculateStatistics(
            studentsKarmaData
              .filter(
                (studentKarmaData) => studentKarmaData.status === 'success',
              )
              .map((studentKarmaData) => Number(studentKarmaData.result)),
            discipulusBaseKarma,
          )
        : undefined,
    [studentsKarmaData],
  )

  if (studentsData?.students.length === 0) {
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
    (!studentsData && !errorLoadingStudents) ||
    statistics === undefined
  ) {
    return (
      <Center>
        <Spinner />
      </Center>
    )
  }

  if (errorLoadingStudents || errorLoadingKarma || !studentsData) {
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
      <DashboardBlock title="Max Value" value={statistics.maxValue} isInt />
      <DashboardBlock title="Min Value" value={statistics.minValue} isInt />
      <DashboardBlock title="Mean" value={statistics.mean} />
      <DashboardBlock title="Median" value={statistics.median} isInt />
      <DashboardBlock title="Std. Deviation" value={statistics.stdDeviation} />
      <DashboardBlock
        title="Learning Return Index"
        value={statistics.learningReturnIndex}
      />
    </SimpleGrid>
  )
}
