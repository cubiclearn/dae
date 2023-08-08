import { Box, Text, VStack, HStack, Link } from '@chakra-ui/react'
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
      <HStack
        alignItems={'flex-start'}
        width={'100%'}
        borderRadius={'xl'}
        padding={8}
        bg={'white'}
        boxShadow={'base'}
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
    </Link>
  )
}
