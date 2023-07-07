import React, { ChangeEvent, useCallback, useEffect, useState } from 'react'
import { Button, VStack, Select, Text, HStack } from '@chakra-ui/react'
import { Proposal, useVotePropsal } from '@dae/snapshot'
import { ChainSnapshotHub } from '@dae/chains'

type ProposalVoteProps = {
  proposal: Proposal
}

export const ProposalVote: React.FC<ProposalVoteProps> = ({ proposal }) => {
  const [choice, setChoice] = useState<number>(1)
  const { vote } = useVotePropsal(
    proposal.space.name,
    parseInt(proposal.network) as keyof typeof ChainSnapshotHub,
    proposal.space.id,
    proposal.type,
    choice,
  )
  const onVoteChoiceChange = useCallback(
    (event: ChangeEvent<HTMLSelectElement>) => {
      const targetValue = parseInt(event.target.value)
      setChoice(targetValue)
    },
    [],
  )

  const onVote = async () => {
    await vote()
  }

  useEffect(() => {
    console.log(choice)
  }, [choice])

  return (
    <VStack spacing={4} alignItems={'flex-start'}>
      <Text fontSize={'lg'} fontWeight={'semibold'}>
        Cast a vote:
      </Text>
      <HStack spacing={4}>
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
    </VStack>
  )
}
