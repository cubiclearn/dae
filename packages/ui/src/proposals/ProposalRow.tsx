import {
  Box,
  Text,
  VStack,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
} from '@chakra-ui/react'
import { Proposal } from '@dae/snapshot'
import { ProposalCountdownTimer } from './ProposalCountdown'
import { ProposalStats } from './ProposalStats'
import { ProposalVote } from './ProposalVote'
import { ProposalDescription } from './ProposalDescription'

type ProposalRowProps = {
  proposal: Proposal
}

export const ProposalRow: React.FC<ProposalRowProps> = ({ proposal }) => {
  return (
    <AccordionItem borderWidth={1} borderRadius={'lg'} width={'100%'}>
      <AccordionButton textAlign={'left'} py={4}>
        <Box width={'60%'}>
          <VStack width={'100%'} alignItems={'flex-start'}>
            <Text fontSize={'xl'} fontWeight={'semibold'}>
              {proposal.title}
            </Text>
            <Text color={'blackAlpha.700'}>Proposed by: {proposal.author}</Text>
          </VStack>
        </Box>
        <Box width={'40%'}>
          <ProposalCountdownTimer timestamp={proposal.end} />
        </Box>
      </AccordionButton>
      <AccordionPanel py={4} borderTop={'1px solid'} borderColor={'gray.200'}>
        <VStack spacing={8} alignItems={'flex-start'} width={'100%'}>
          <VStack width={'100%'} alignItems={'flex-start'} spacing={8}>
            <ProposalStats
              choices={proposal.choices}
              scores={proposal.scores}
              total_score={proposal.scores_total}
            />
            <ProposalDescription proposal={proposal} />
          </VStack>
          {proposal.state === 'active' ? (
            <VStack
              py={4}
              borderTop={'1px solid'}
              borderColor={'gray.200'}
              width={'100%'}
              alignItems={'flex-start'}
            >
              <ProposalVote proposal={proposal} />
            </VStack>
          ) : (
            <></>
          )}
        </VStack>
      </AccordionPanel>
    </AccordionItem>
  )
}
