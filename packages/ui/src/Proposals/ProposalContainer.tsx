import { useCourseSpace } from '@dae/snapshot'
import {
  Center,
  Spinner,
  Alert,
  AlertIcon,
  Box,
  AlertTitle,
  AlertDescription,
} from '@chakra-ui/react'
import { CreateSnapshotSpaceForm } from '../Forms'
import React from 'react'
import { Address, useNetwork } from 'wagmi'
import { useCourseData } from '../CourseProvider'

type ProposalContainerProps = {
  courseAddress: Address
  children: React.ReactNode
}

export const ProposalContainer: React.FC<ProposalContainerProps> = ({
  courseAddress,
  children,
}) => {
  const { chain } = useNetwork()
  const {
    data: courseData,
    isLoading: isLoadingCourseData,
    error: errorLoadingCourseData,
  } = useCourseData()
  const { data, isLoading, isError } = useCourseSpace(courseAddress, chain?.id)

  if (isLoading || isLoadingCourseData) {
    return (
      <Center>
        <Spinner />
      </Center>
    )
  }

  if (isError || errorLoadingCourseData) {
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

  if (
    data?.space === null ||
    data?.space.strategies[0].params.address !==
      courseData?.karma_access_control_address ||
    chain?.id.toString() !== data?.space.network
  ) {
    return <CreateSnapshotSpaceForm />
  }

  return <>{children}</>
}
