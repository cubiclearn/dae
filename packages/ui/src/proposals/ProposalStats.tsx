import React from 'react'
import { Progress, Text, VStack } from '@chakra-ui/react'

type ProposalStatsProps = {
  choices: string[]
  scores: number[]
  total_score: number
}

export const ProposalStats: React.FC<ProposalStatsProps> = ({
  choices,
  scores,
  total_score,
}) => {
  const sortedChoices: { choice: string; score: number }[] = choices
    .map((choice, index) => {
      return {
        choice: choice,
        score: scores[index],
      }
    })
    .sort((a, b) => b.score - a.score)

  return (
    <VStack alignItems={'flex-start'} width={'100%'}>
      <Text fontSize={'lg'} fontWeight={'bold'}>
        Votes
      </Text>
      <VStack width={'100%'} spacing={4}>
        {sortedChoices.map(({ choice, score }) => {
          return (
            <VStack
              spacing={2}
              alignItems={'flex-start'}
              width={'100%'}
              key={choice}
            >
              <Text fontSize={'md'} fontWeight={'semibold'}>
                {choice}
              </Text>
              <Text fontSize={'xs'} fontWeight={'semibold'}>
                {score}
              </Text>
              <Progress
                size='lg'
                value={(score / total_score) * 100}
                width={'100%'}
              />
            </VStack>
          )
        })}
      </VStack>
    </VStack>
  )
}
