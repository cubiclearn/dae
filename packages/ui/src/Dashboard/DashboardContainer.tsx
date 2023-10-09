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
import { useIsAdmin, useIsMagister } from '@dae/wagmi'

type DashboardContainerProps = {
  courseAddress: Address
}

export const DashboardContainer: React.FC<DashboardContainerProps> = ({
  courseAddress,
}) => {
  const { chain } = useNetwork()
  const {
    data: courseData,
    isLoading: isCourseDataLoading,
    error,
  } = useCourseData()
  const {
    data: isAdmin,
    isLoading: isLoadingAdminState,
    isError: isErrorLoadingAdminState,
  } = useIsAdmin(courseAddress)
  const {
    data: isMagister,
    isLoading: isLoadingMagisterState,
    isError: isErrorLoadingMagisterState,
  } = useIsMagister(courseAddress)

  if (isCourseDataLoading || isLoadingAdminState || isLoadingMagisterState) {
    return (
      <Center>
        <Spinner />
      </Center>
    )
  }

  if (error || isErrorLoadingAdminState || isErrorLoadingMagisterState) {
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

  if (isAdmin || isMagister) {
    return (
      <Stack spacing={8}>
        <Stack spacing={4}>
          <Text fontSize={'2xl'} fontWeight={'semibold'}>
            Your statistics
          </Text>
          <MyKarmaSection
            karmaAccessControlAddress={
              courseData?.karma_access_control_address as Address
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
            karmaAccessControlAddress={
              courseData?.karma_access_control_address as Address
            }
            discipulusBaseKarma={courseData?.discipulus_base_karma}
          />
        </Stack>
        <Stack spacing={4}>
          <Text fontSize={'2xl'} fontWeight={'semibold'}>
            Students Leaderboard
          </Text>
          <LeaderboardSection
            courseAddress={courseAddress}
            chainId={chain?.id}
            karmaAccessControlAddress={
              courseData?.karma_access_control_address as Address
            }
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
            courseData?.karma_access_control_address as Address
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
          karmaAccessControlAddress={
            courseData?.karma_access_control_address as Address
          }
        />
      </Stack>
    </Stack>
  )
}
