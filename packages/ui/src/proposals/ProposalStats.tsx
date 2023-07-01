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
    <VStack width={'100%'} spacing={4}>
      {sortedChoices.map(({ choice, score }) => {
        return (
          <VStack spacing={2} alignItems={'flex-start'} width={'100%'}>
            <Text fontSize={'sm'} fontWeight={'semibold'}>
              {choice}
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
  )
}
