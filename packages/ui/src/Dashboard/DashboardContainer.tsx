import { Address, useNetwork } from 'wagmi'
import { useCourseData } from '../CourseProvider'
import React from 'react'
import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Box,
  Center,
  Spinner,
  Stack,
  Text,
} from '@chakra-ui/react'
import {
  LeaderboardSection,
  PartecipantsSection,
  StatisticsSection,
} from './Sections'
import { Course } from '@dae/database'

type DashboardContainerProps = {
  courseAddress: Address
}

export const DashboardContainer: React.FC<DashboardContainerProps> = ({
  courseAddress,
}) => {
  const {
    data: courseData,
    isLoading: isCourseDataLoading,
    error,
  } = useCourseData()
  const { chain } = useNetwork()

  if (isCourseDataLoading || (!courseData && !error)) {
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
          <AlertDescription>This course does not exist</AlertDescription>
        </Box>
      </Alert>
    )
  }

  return (
    <Stack spacing={8}>
      <Stack spacing={4}>
        <Text fontSize={'2xl'} fontWeight={'semibold'}>
          Participants
        </Text>
        <PartecipantsSection
          courseAddress={courseAddress}
          chainId={chain?.id}
        />
      </Stack>
      <Stack spacing={4}>
        <Text fontSize={'2xl'} fontWeight={'semibold'}>
          Students Karma
        </Text>
        <StatisticsSection
          courseAddress={courseAddress}
          chainId={chain?.id}
          courseData={courseData as Course | undefined}
        />
      </Stack>
      <Stack spacing={4}>
        <Text fontSize={'2xl'} fontWeight={'semibold'}>
          Students Leaderboard
        </Text>
        <LeaderboardSection
          courseAddress={courseAddress}
          chainId={chain?.id}
          courseData={courseData as Course | undefined}
        />
      </Stack>
    </Stack>
  )
}
