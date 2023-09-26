import { Stack, Text } from '@chakra-ui/react'
import React from 'react'

type KarmaCounterProps = {
  karmaAmount: number | undefined
}

export const KarmaCounter: React.FC<KarmaCounterProps> = ({ karmaAmount }) => {
  return (
    <Stack textAlign={'center'} spacing={'10px'}>
      <Text fontSize={'xl'} fontWeight={'semibold'}>
        Karma Balance
      </Text>
      <Text fontSize={'5xl'} fontWeight={'bold'}>
        {karmaAmount ? karmaAmount : '--'}
      </Text>
    </Stack>
  )
}
