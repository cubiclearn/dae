import React, { ChangeEvent, useCallback, useEffect, useState } from 'react'
import {
  Button,
  VStack,
  Select,
  Text,
  HStack,
  useToast,
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Box,
} from '@chakra-ui/react'
import { Proposal, useVotePropsal } from '@dae/snapshot'
import { ChainSnapshotHub } from '@dae/chains'

type ProposalVoteProps = {
  proposal: Proposal
}

export const ProposalVote: React.FC<ProposalVoteProps> = ({ proposal }) => {
  const [choice, setChoice] = useState<number>(1)

  const { vote, isError, isLoading, isSuccess, error } = useVotePropsal(
    proposal.space.id,
    parseInt(proposal.network) as keyof typeof ChainSnapshotHub,
    proposal.id,
    proposal.type,
    choice,
  )

  const toast = useToast()

  useEffect(() => {
    if (isError) {
      toast({
        title: 'Error voting proposal.',
        status: 'error',
      })
    }
    if (isSuccess) {
      toast({
        title: 'Succefully voted proposal',
        status: 'success',
      })
    }
    if (isLoading) {
      toast({
        title: 'Voting proposal...',
        status: 'info',
      })
    }
  }, [isLoading, isError, isSuccess])

  const onVoteChoiceChange = useCallback(
    (event: ChangeEvent<HTMLSelectElement>) => {
      const targetValue = parseInt(event.target.value)
      setChoice(targetValue)
    },
    [],
  )

  const onVote = async () => {
    try {
      await vote()
    } catch (_e) {}
  }

  return (
    <VStack spacing={4} alignItems={'flex-start'}>
      <Text fontSize={'lg'} fontWeight={'semibold'}>
        Cast a vote:
      </Text>
      <VStack spacing={4} alignItems={'flex-start'}>
        <HStack spacing={4} alignItems={'flex-start'}>
          <Select
            onChange={onVoteChoiceChange}
            defaultValue={proposal.choices[0]}
          >
            {proposal.choices.map((choice, index) => {
              return (
                <option key={index + 1} value={index + 1}>
                  {choice}
                </option>
              )
            })}
          </Select>
          <Button onClick={onVote}>Vote</Button>
        </HStack>
        {isError ? (
          <Alert status='error'>
            <AlertIcon />
            <Box>
              <AlertTitle>Error.</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Box>
          </Alert>
        ) : (
          <></>
        )}
      </VStack>
    </VStack>
  )
}
