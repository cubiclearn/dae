import React, { useEffect, useRef } from 'react'
import {
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Box,
  Center,
  Spinner,
  Stack,
} from '@chakra-ui/react'
import { useCourseProposals } from '@dae/snapshot'
import { ProposalRow } from './ProposalRow'
import { Address, useNetwork } from 'wagmi'
import { useIntersectionObserver } from '@dae/hooks'

type ProposalRowListProps = {
  courseAddress: Address
  status: 'active' | 'closed'
}

export const ProposalRowList: React.FC<ProposalRowListProps> = ({
  courseAddress,
  status,
}) => {
  const { chain } = useNetwork()
  const { data, isLoading, error, setSize, size, hasMore } = useCourseProposals(
    courseAddress,
    chain?.id,
    status,
  )

  const ref = useRef<HTMLDivElement | null>(null)
  const observer = useIntersectionObserver(ref, {})

  useEffect(() => {
    if (observer?.isIntersecting && hasMore) {
      setSize(size + 1)
    }
  }, [observer])

  if (isLoading) {
    return (
      <Center>
        <Spinner />
      </Center>
    )
  }

  if (error) {
    return (
      <Alert status="error">
        <AlertIcon />
        <Box>
          <AlertTitle>Something went wrong.</AlertTitle>
          <AlertDescription>
            There is an error fetching your data. Try again later.
          </AlertDescription>
        </Box>
      </Alert>
    )
  }

  if (!data || data.proposals.length === 0) {
    return (
      <Alert status="info">
        <AlertIcon />
        <Box>
          <AlertTitle>Nothing to show.</AlertTitle>
          <AlertDescription>There is no proposal to show</AlertDescription>
        </Box>
      </Alert>
    )
  }

  return (
    <Stack spacing={6}>
      {data.proposals.map((proposal) => {
        return <ProposalRow key={proposal.id} proposal={proposal} />
      })}
      {hasMore && (
        <Box p={4}>
          <Center ref={ref}>
            <Spinner />
          </Center>
        </Box>
      )}
    </Stack>
  )
}
