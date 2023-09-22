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
  MyKarmaSection,
  PartecipantsSection,
  StatisticsSection,
} from './Sections'
import { useIsAdminOrMagister } from '@dae/wagmi'

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
  const {
    data: isAdminOrMagister,
    isLoading: isFetchingUserRole,
    isError: isErrorFetchingUserRole,
  } = useIsAdminOrMagister(courseAddress)

  if (isCourseDataLoading || (!courseData && !error) || isFetchingUserRole) {
    return (
      <Center>
        <Spinner />
      </Center>
    )
  }

  if (error || isErrorFetchingUserRole || !courseData) {
    return (
      <Alert status="error">
        <AlertIcon />
        <Box>
          <AlertTitle>Something went wrong.</AlertTitle>
          <AlertDescription>This course does not exist</AlertDescription>
        </Box>
      </Alert>
    )
  }

  if (isAdminOrMagister) {
    return (
      <Stack spacing={8}>
        <Stack spacing={4}>
          <Text fontSize={'2xl'} fontWeight={'semibold'}>
            Your statistics
          </Text>
          <MyKarmaSection
            karmaAccessControlAddress={
              courseData.karma_access_control_address as Address
            }
          />
        </Stack>
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
            courseData={courseData}
          />
        </Stack>
        <Stack spacing={4}>
          <Text fontSize={'2xl'} fontWeight={'semibold'}>
            Students Leaderboard
          </Text>
          <LeaderboardSection
            courseAddress={courseAddress}
            chainId={chain?.id}
            courseData={courseData}
          />
        </Stack>
      </Stack>
    )
  }

  return (
    <Stack spacing={8}>
      <Stack spacing={4}>
        <Text fontSize={'2xl'} fontWeight={'semibold'}>
          Your statistics
        </Text>
        <MyKarmaSection
          karmaAccessControlAddress={
            courseData.karma_access_control_address as Address
          }
        />
      </Stack>
      <Stack spacing={4}>
        <Text fontSize={'2xl'} fontWeight={'semibold'}>
          Students leaderboard
        </Text>
        <LeaderboardSection
          courseAddress={courseAddress}
          chainId={chain?.id}
          courseData={courseData}
        />
      </Stack>
    </Stack>
  )
}
