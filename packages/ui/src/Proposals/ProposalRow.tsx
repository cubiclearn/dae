import { Box, Text, Link, Stack } from '@chakra-ui/react'
import { Proposal } from '@dae/snapshot'
import { ProposalCountdownTimer } from './ProposalCountdown'
import NextLink from 'next/link'
import { useRouter } from 'next/router'

type ProposalRowProps = {
  proposal: Proposal
}

export const ProposalRow: React.FC<ProposalRowProps> = ({ proposal }) => {
  const router = useRouter()
  const { address: courseAddress } = router.query

  return (
    <Link
      width={'100%'}
      as={NextLink}
      href={`/course/${courseAddress}/proposals/${proposal.id}`}
      _hover={{ textDecoration: 'none' }}
    >
      <Stack
        direction={{ base: 'column', lg: 'row' }}
        borderRadius={'xl'}
        padding={8}
        bg={'white'}
        boxShadow={'base'}
        spacing={4}
      >
        <Box width={{ base: '100%', lg: '70%' }}>
          <Stack>
            <Text fontSize={'xl'} fontWeight={'semibold'}>
              {proposal.title}
            </Text>
            <Text color={'blackAlpha.700'}>Proposed by: {proposal.author}</Text>
          </Stack>
        </Box>
        <Box width={{ base: '100%', lg: '30%' }}>
          <ProposalCountdownTimer timestamp={proposal.end} />
        </Box>
      </Stack>
    </Link>
  )
}
