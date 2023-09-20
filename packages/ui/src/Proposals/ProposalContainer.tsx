import { useSpace } from '@dae/snapshot'
import { useCourseData } from '../CourseProvider'
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

type ProposalContainerProps = {
  children: React.ReactNode
}

export const ProposalContainer: React.FC<ProposalContainerProps> = ({
  children,
}) => {
  const { data: courseData } = useCourseData()

  const {
    data: snapshotSpaceData,
    isLoading: isLoadingSnapshotSpaceData,
    isError: isErrorLoadingSnapshotSpaceDat,
    error: errorLoadingSnapshotSpaceData,
  } = useSpace(courseData?.snapshot_space_ens)

  if (
    isLoadingSnapshotSpaceData ||
    (!snapshotSpaceData && !isErrorLoadingSnapshotSpaceDat)
  ) {
    return (
      <Center>
        <Spinner />
      </Center>
    )
  }

  if (errorLoadingSnapshotSpaceData) {
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
    !snapshotSpaceData?.space ||
    Number(snapshotSpaceData?.space.network) !== courseData?.chain_id ||
    snapshotSpaceData?.space.strategies[0].params.address !==
      courseData?.karma_access_control_address
  ) {
    return <CreateSnapshotSpaceForm />
  }

  return <>{children}</>
}
