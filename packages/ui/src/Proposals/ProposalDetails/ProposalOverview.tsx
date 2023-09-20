import React from 'react'
import {
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Box,
  Center,
  Spinner,
  Stack,
  Link,
  Button,
} from '@chakra-ui/react'
import { useSpaceProposal } from '@dae/snapshot'
import { ProposalVote } from './ProposalVote'
import { ProposalDescription } from './ProposalDescription'
import { ProposalStats } from './ProposalStats'
import { ProposalHeading } from './ProposalHeading'
import NextLink from 'next/link'
import { ArrowBackIcon } from '@chakra-ui/icons'

type ProposalOverviewProps = {
  proposalId: string
  courseAddress: string
}

export const ProposalOverview: React.FC<ProposalOverviewProps> = ({
  proposalId,
  courseAddress,
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
          <AlertTitle>Something went wrong.</AlertTitle>
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
    <Stack spacing={{ base: 8, lg: 4 }}>
      <Box>
        <Link
          as={NextLink}
          href={`/course/${courseAddress}/proposals/explore?active=${
            data.proposal.state === 'active' ? true : false
          }`}
        >
          <Button leftIcon={<ArrowBackIcon />}>Back</Button>
        </Link>
      </Box>
      <Stack
        padding={8}
        borderRadius="xl"
        bg={'white'}
        boxShadow={'base'}
        spacing={8}
      >
        <ProposalHeading
          title={data.proposal.title}
          author={data.proposal.author}
          end={data.proposal.end}
        />
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
    </Stack>
  )
}
