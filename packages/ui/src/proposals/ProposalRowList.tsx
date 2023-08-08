import React from 'react'
import {
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Box,
  Center,
  Spinner,
  VStack,
} from '@chakra-ui/react'
import { useSpaceProposals } from '@dae/snapshot'
import { ProposalRow } from './ProposalRow'
import { useCourseData } from '../CourseProvider'

type ProposalRowListProps = {
  state: string
}

export const ProposalRowList: React.FC<ProposalRowListProps> = ({ state }) => {
  const course = useCourseData()
  const { data, isLoading, error } = useSpaceProposals(
    course.data ? course.data.snapshot_space_ens : undefined,
    state,
  )

  if (isLoading) {
    return (
      <Center>
        <Spinner />
      </Center>
    )
  }

  if (error) {
    return (
      <Alert status='error'>
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

  if (!data || data.proposals!.length === 0) {
    return (
      <Alert status='info'>
        <AlertIcon />
        <Box>
          <AlertTitle>Nothing to show.</AlertTitle>
          <AlertDescription>There is no proposal to show</AlertDescription>
        </Box>
      </Alert>
    )
  }

  return (
    <VStack spacing={6}>
      {data.proposals!.map((proposal) => {
        return <ProposalRow key={proposal.id} proposal={proposal} />
      })}
    </VStack>
  )
}
