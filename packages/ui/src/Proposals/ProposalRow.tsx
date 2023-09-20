import { Box, Link } from '@chakra-ui/react'
import NextLink from 'next/link'
import { useRouter } from 'next/router'
import { ProposalHeading } from './ProposalDetails/ProposalHeading'
import { Proposal } from '@dae/snapshot'

type ProposalRowProps = {
  proposal: Partial<Proposal>
}

export const ProposalRow: React.FC<ProposalRowProps> = ({ proposal }) => {
  const router = useRouter()
  const { address: courseAddress } = router.query

  const { title = '', author = '', end = 0 } = proposal

  return (
    <Link
      width={'100%'}
      as={NextLink}
      href={`/course/${courseAddress}/proposals/${proposal.id}`}
      _hover={{ textDecoration: 'none' }}
    >
      <Box borderRadius={'xl'} padding={8} bg={'white'} boxShadow={'base'}>
        <ProposalHeading title={title} author={author} end={end} />
      </Box>
    </Link>
  )
}
