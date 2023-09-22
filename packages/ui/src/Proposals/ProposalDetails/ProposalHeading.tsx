import { Stack, Box, Text } from '@chakra-ui/react'
import React from 'react'
import { ProposalCountdownTimer } from './ProposalCountdown'

type ProposalHeadingProps = {
  title: string
  author: string
  end: number
}

export const ProposalHeading: React.FC<ProposalHeadingProps> = ({
  title,
  author,
  end,
}) => {
  return (
    <Stack direction={{ base: 'column', lg: 'row' }} spacing={4}>
      <Box width={{ base: '100%', lg: '70%' }}>
        <Stack>
          <Text fontSize={'xl'} fontWeight={'semibold'}>
            {title}
          </Text>
          <Text fontWeight={'semibold'}>
            Proposed by:{' '}
            <Text as="span" fontWeight={'normal'}>
              {author}
            </Text>
          </Text>
        </Stack>
      </Box>
      <Box width={{ base: '100%', lg: '30%' }}>
        <ProposalCountdownTimer timestamp={end} />
      </Box>
    </Stack>
  )
}
