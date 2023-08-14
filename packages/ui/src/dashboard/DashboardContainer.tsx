import { Address, useNetwork } from 'wagmi'
import { useCourseData } from '../CourseProvider'
import { useCourseStudents, useCourseStudentsKarma } from '@dae/wagmi'
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

const calculateStatistics = (data: number[]) => {
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

  return {
    maxValue,
    minValue,
    mean,
    median,
    stdDeviation,
  }
}

export const DashboardContainer: React.FC<DashboardContainerProps> = ({
  courseAddress,
}) => {
  const course = useCourseData()
  const { chain } = useNetwork()
  const { data: studentsData } = useCourseStudents(courseAddress, chain?.id)
  const { data: studentsKarmaData, error } = useCourseStudentsKarma(
    studentsData
      ? studentsData.data.students.map(
          (student) => student.user_address as Address,
        )
      : [],
    course.data
      ? (course.data.karma_access_control_address as Address)
      : undefined,
    chain?.id,
  )

  if (!studentsData || !studentsKarmaData) {
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
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            There is an error fetching your data. Try again later.
          </AlertDescription>
        </Box>
      </Alert>
    )
  }

  const statistics = calculateStatistics(studentsKarmaData)

  return (
    <Stack spacing={6}>
      <Stack spacing={4}>
        <Text fontSize={'2xl'} fontWeight={'semibold'}>
          Students
        </Text>
        <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 5 }} spacing={4}>
          <DashboardBlock
            title="Total students"
            value={studentsKarmaData.length}
            isInt
          />
        </SimpleGrid>
      </Stack>
      <Stack spacing={4}>
        <Text fontSize={'2xl'} fontWeight={'semibold'}>
          Karma
        </Text>
        <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 5 }} spacing={4}>
          <DashboardBlock title="Max Value" value={statistics.maxValue} />
          <DashboardBlock title="Min Value" value={statistics.minValue} />
          <DashboardBlock title="Mean" value={statistics.mean} />
          <DashboardBlock title="Median" value={statistics.median} />
          <DashboardBlock
            title="Std Deviation"
            value={statistics.stdDeviation}
          />
        </SimpleGrid>
      </Stack>
    </Stack>
  )
}
