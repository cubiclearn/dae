import React from 'react'
import {
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Box,
  Center,
  Spinner,
  Text,
  Stack,
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

  if (!data) {
    return (
      <Alert status="info">
        <AlertIcon />
        <Box>
          <AlertTitle>Nothing to show.</AlertTitle>
          <AlertDescription>There is no course to show</AlertDescription>
        </Box>
      </Alert>
    )
  }

  return (
    <Stack
      padding={8}
      borderRadius="xl"
      bg={'white'}
      boxShadow={'base'}
      spacing={8}
    >
      <Stack direction={{ base: 'column', lg: 'row' }} spacing={4}>
        <Box width={{ base: '100%', lg: '70%' }}>
          <Stack>
            <Text fontSize={'xl'} fontWeight={'semibold'}>
              {data.proposal.title}
            </Text>
            <Text color={'blackAlpha.700'}>
              Proposed by: {data.proposal.author}
            </Text>
          </Stack>
        </Box>
        <Box width={{ base: '100%', lg: '30%' }}>
          <ProposalCountdownTimer timestamp={data.proposal.end} />
        </Box>
      </Stack>
      <Box
        width={'100%'}
        pt={6}
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
        pt={6}
        borderTop={'1px solid'}
        borderColor={'gray.200'}
      >
        <ProposalDescription proposal={data.proposal} />
      </Box>
      {data.proposal.state === 'active' ? (
        <Box
          pt={6}
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
    </Stack>
  )
}
