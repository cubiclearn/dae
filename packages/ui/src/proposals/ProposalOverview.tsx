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
  Text,
  HStack,
} from '@chakra-ui/react'
import { useSpaceProposal } from '@dae/snapshot'
import { ProposalCountdownTimer } from './ProposalCountdown'
import { ProposalVote } from './ProposalVote'
import { ProposalDescription } from './ProposalDescription'
import { ProposalStats } from './ProposalStats'

type ProposalOverviewProps = {
  proposalId: string
}

export const ProposalOverview: React.FC<ProposalOverviewProps> = ({
  proposalId,
}) => {
  const { data, isLoading, error } = useSpaceProposal(proposalId as string)

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

  if (!data) {
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
    <VStack
      alignItems={'flex-start'}
      width={'100%'}
      borderWidth={'1px'}
      borderColor={'gray.200'}
      borderRadius={'xl'}
      px={6}
    >
      <HStack alignItems={'flex-start'} width={'100%'} py={6}>
        <Box width={'60%'}>
          <VStack width={'100%'} alignItems={'flex-start'}>
            <Text fontSize={'xl'} fontWeight={'bold'}>
              {data.proposal.title}
            </Text>
            <Text color={'blackAlpha.700'}>
              Proposed by: {data.proposal.author}
            </Text>
          </VStack>
        </Box>
        <Box width={'40%'}>
          <ProposalCountdownTimer timestamp={data.proposal.end} />
        </Box>
      </HStack>
      <Box
        width={'100%'}
        py={6}
        borderTop={'1px solid'}
        borderColor={'gray.200'}
      >
        <ProposalStats
          choices={data.proposal.choices}
          scores={data.proposal.scores}
          total_score={data.proposal.scores_total}
        />
      </Box>
      <Box
        width={'100%'}
        py={6}
        borderTop={'1px solid'}
        borderColor={'gray.200'}
      >
        <ProposalDescription proposal={data.proposal} />
      </Box>
      {data.proposal.state === 'active' ? (
        <Box
          py={6}
          borderTop={'1px solid'}
          borderColor={'gray.200'}
          width={'100%'}
          alignItems={'flex-start'}
        >
          <ProposalVote proposal={data.proposal} />
        </Box>
      ) : (
        <></>
      )}
    </VStack>
  )
}
