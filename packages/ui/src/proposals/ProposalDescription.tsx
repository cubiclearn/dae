import React from 'react'
import {
  VStack,
  Text,
  Heading,
  List,
  ListItem,
  UnorderedList,
} from '@chakra-ui/react'
import { Proposal } from '@dae/snapshot'
import ReactMarkdown from 'react-markdown'

type ProposalDescriptionProps = {
  proposal: Proposal
}

export const ProposalDescription: React.FC<ProposalDescriptionProps> = ({
  proposal,
}) => {
  return (
    <VStack spacing={4} alignItems={'flex-start'}>
      <Text fontSize={'lg'} fontWeight={'semibold'}>
        Description:
      </Text>
      <ReactMarkdown
        components={{
          h1: ({ children }) => (
            <Heading as='h3' fontSize={'2xl'} fontWeight={'normal'} mt='4'>
              {children}
            </Heading>
          ),
          h2: ({ children }) => (
            <Heading as='h4' fontSize={'xl'} fontWeight={'normal'} mt='4'>
              {children}
            </Heading>
          ),
          h3: ({ children }) => (
            <Heading as='h5' fontSize={'lg'} fontWeight={'normal'} mt='4'>
              {children}
            </Heading>
          ),
          ol: ({ children }) => <List>{children}</List>,
          ul: ({ children }) => <UnorderedList>{children}</UnorderedList>,
          li: ({ children }) => <ListItem>{children}</ListItem>,
          p: ({ children }) => <Text fontSize={'md'}>{children}</Text>,
        }}
      >
        {proposal.body}
      </ReactMarkdown>
    </VStack>
  )
}
