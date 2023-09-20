import { Box, Link } from '@chakra-ui/react'
import { Proposal } from '@dae/snapshot'
import NextLink from 'next/link'
import { useRouter } from 'next/router'
import { ProposalHeading } from './ProposalDetails/ProposalHeading'

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
      <Box borderRadius={'xl'} padding={8} bg={'white'} boxShadow={'base'}>
        <ProposalHeading
          title={proposal.title}
          author={proposal.author}
          end={proposal.end}
        />
      </Box>
    </Link>
  )
}
