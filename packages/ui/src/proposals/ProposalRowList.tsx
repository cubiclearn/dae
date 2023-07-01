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

type ProposalRowListProps = {
  space: string
  state: string
}

export const ProposalRowList: React.FC<ProposalRowListProps> = ({
  space,
  state,
}) => {
  const { data, isLoading, error } = useSpaceProposals(space, state)

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
          <AlertDescription>There is no course to show</AlertDescription>
        </Box>
      </Alert>
    )
  }

  return (
    <VStack spacing={4}>
      {data.proposals!.map((proposal) => {
        return <ProposalRow key={proposal.id} proposal={proposal} />
      })}
    </VStack>
  )
}
