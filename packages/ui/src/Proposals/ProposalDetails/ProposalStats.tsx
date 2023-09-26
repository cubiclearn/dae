import React from 'react'
import { Progress, Stack, Text } from '@chakra-ui/react'

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
    <Stack>
      <Text fontSize={'lg'} fontWeight={'bold'}>
        Votes
      </Text>
      <Stack spacing={6} pt={2}>
        {sortedChoices.map(({ choice, score }) => {
          return (
            <Stack spacing={2} key={choice}>
              <Text fontSize={'md'} fontWeight={'semibold'}>
                {choice}
              </Text>
              <Text fontSize={'xs'} fontWeight={'semibold'}>
                {score ?? 0}
              </Text>
              <Progress
                size="lg"
                value={score ? (score / total_score) * 100 : 0}
                width={'100%'}
                borderRadius={'md'}
              />
            </Stack>
          )
        })}
      </Stack>
    </Stack>
  )
}
