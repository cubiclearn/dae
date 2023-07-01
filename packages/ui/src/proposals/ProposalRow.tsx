import { Box, HStack, Text, VStack } from '@chakra-ui/react'
import { Proposal } from '@dae/snapshot'
import { ProposalCountdownTimer } from './ProposalCountdown'

type ProposalRowProps = {
  proposal: Proposal
}

export const ProposalRow: React.FC<ProposalRowProps> = ({ proposal }) => {
  return (
    <VStack
      spacing={4}
      p={4}
      borderWidth={1}
      borderRadius={'lg'}
      width={'100%'}
    >
      <HStack borderBottom={'1px solid'} width={'100%'} pb={4}>
        <Box width={'60%'}>
          <VStack width={'100%'} alignItems={'flex-start'}>
            <Text fontSize={'lg'} fontWeight={'semibold'}>
              {proposal.title}
            </Text>
            <Text>Proposed by: {proposal.author}</Text>
          </VStack>
        </Box>
        <Box width={'40%'}>
          <ProposalCountdownTimer timestamp={proposal.end} />
        </Box>
      </HStack>
      <Box width={'100%'}>
        <Text>Voting</Text>
      </Box>
    </VStack>
  )
}
