import React from 'react'
import {
  Text,
  Heading,
  ListItem,
  UnorderedList,
  Stack,
  OrderedList,
} from '@chakra-ui/react'
import ReactMarkdown from 'react-markdown'
import { Proposal } from '@dae/snapshot'

type ProposalDescriptionProps = {
  proposal: Proposal
}

export const ProposalDescription: React.FC<ProposalDescriptionProps> = ({
  proposal,
}) => {
  return (
    <Stack spacing={4}>
      <Text fontSize={'lg'} fontWeight={'bold'}>
        Description
      </Text>
      <ReactMarkdown
        components={{
          h1: ({ children }) => (
            <Heading as="h3" fontSize={'2xl'} fontWeight={'semibold'} mt="4">
              {children}
            </Heading>
          ),
          h2: ({ children }) => (
            <Heading as="h4" fontSize={'xl'} fontWeight={'semibold'} mt="4">
              {children}
            </Heading>
          ),
          h3: ({ children }) => (
            <Heading as="h5" fontSize={'lg'} fontWeight={'semibold'} mt="4">
              {children}
            </Heading>
          ),
          ol: ({ children }) => (
            <OrderedList marginInlineStart={'1em !important'}>
              {children}
            </OrderedList>
          ),
          ul: ({ children }) => (
            <UnorderedList marginInlineStart={'1em !important'}>
              {children}
            </UnorderedList>
          ),
          li: ({ children }) => <ListItem>{children}</ListItem>,
          p: ({ children }) => <Text fontSize={'md'}>{children}</Text>,
        }}
      >
        {proposal.body}
      </ReactMarkdown>
    </Stack>
  )
}
