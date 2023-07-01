import {
  Box,
  HStack,
  Text,
  VStack,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionIcon,
  AccordionPanel,
  Heading,
  UnorderedList,
  ListItem,
  List,
} from '@chakra-ui/react'
import { Proposal } from '@dae/snapshot'
import { ProposalCountdownTimer } from './ProposalCountdown'
import ReactMarkdown from 'react-markdown'
import { ProposalStats } from './ProposalStats'

type ProposalRowProps = {
  proposal: Proposal
}

export const ProposalRow: React.FC<ProposalRowProps> = ({ proposal }) => {
  return (
    <VStack borderWidth={1} borderRadius={'lg'} width={'100%'}>
      <HStack
        borderBottom={'1px solid'}
        borderColor={'gray.200'}
        width={'100%'}
        p={8}
      >
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
      </HStack>
      <Accordion allowToggle m={'0 !important'} width={'100%'} p={4}>
        <AccordionItem border={'none'}>
          <AccordionButton _expanded={{ display: 'none' }}>
            <Box as='span' flex='1' textAlign='left'>
              More details
            </Box>
            <AccordionIcon />
          </AccordionButton>
          <AccordionPanel pb={4}>
            <VStack spacing={8} alignItems={'flex-start'} width={'100%'}>
              <VStack width={'100%'} alignItems={'flex-start'}>
                <Text fontSize={'lg'} fontWeight={'semibold'}>
                  Votes:
                </Text>
                <ProposalStats
                  choices={proposal.choices}
                  scores={proposal.scores}
                  total_score={proposal.scores_total}
                />
              </VStack>
              <VStack alignItems={'flex-start'} spacing={2}>
                <Text fontSize={'lg'} fontWeight={'semibold'}>
                  Description:
                </Text>
                <ReactMarkdown
                  components={{
                    h1: ({ children }) => (
                      <Heading
                        as='h3'
                        fontSize={'2xl'}
                        fontWeight={'normal'}
                        mt='4'
                      >
                        {children}
                      </Heading>
                    ),
                    h2: ({ children }) => (
                      <Heading
                        as='h4'
                        fontSize={'xl'}
                        fontWeight={'normal'}
                        mt='4'
                      >
                        {children}
                      </Heading>
                    ),
                    h3: ({ children }) => (
                      <Heading
                        as='h5'
                        fontSize={'lg'}
                        fontWeight={'normal'}
                        mt='4'
                      >
                        {children}
                      </Heading>
                    ),
                    ol: ({ children }) => <List>{children}</List>,
                    ul: ({ children }) => (
                      <UnorderedList>{children}</UnorderedList>
                    ),
                    li: ({ children }) => <ListItem>{children}</ListItem>,
                    p: ({ children }) => (
                      <Text fontSize={'md'}>{children}</Text>
                    ),
                  }}
                >
                  {proposal.body}
                </ReactMarkdown>
              </VStack>
            </VStack>
          </AccordionPanel>
        </AccordionItem>
      </Accordion>
    </VStack>
  )
}
