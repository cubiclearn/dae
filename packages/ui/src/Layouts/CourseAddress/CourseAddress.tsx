import React from 'react'
import { Address } from 'viem'
import NextLink from 'next/link'
import { ChainBlockExplorer } from '@dae/chains'
import { Text, Link, Skeleton } from '@chakra-ui/react'
import { ExternalLinkIcon } from '@chakra-ui/icons'

type CourseAddressProps = {
  courseAddress: Address | undefined
  chainId: number | undefined
}

export const CourseAddress: React.FC<CourseAddressProps> = ({
  chainId,
  courseAddress,
}) => {
  if (courseAddress === undefined || chainId === undefined) {
    return (
      <Skeleton
        height={'14px'}
        rounded={'lg'}
        width={{ base: '75%', md: '50%', lg: '30%' }}
      />
    )
  }

  return (
    <Text fontWeight={'semibold'}>
      Course:{' '}
      <Link
        as={NextLink}
        href={`${
          ChainBlockExplorer[chainId as keyof ChainBlockExplorer]
        }/address/${courseAddress}`}
        textDecoration={'none'}
        isExternal
        fontWeight={'normal'}
      >
        {courseAddress} <ExternalLinkIcon mx="2px" />
      </Link>
    </Text>
  )
}
