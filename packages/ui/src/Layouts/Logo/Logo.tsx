import { HStack, Text, Image, Link } from '@chakra-ui/react'
import { FC } from 'react'
import NextLink from 'next/link'

export const Logo: FC = () => {
  return (
    <Link
      as={NextLink}
      fontWeight={500}
      fontSize={20}
      _hover={{
        textDecoration: 'none',
      }}
      href={'/'}
    >
      <HStack spacing={3}>
        <Image src='/dae-logo.png' width={8} height={8} alt='DAE Logo' />
        <Text fontWeight={'bold'}>DAE</Text>
      </HStack>
    </Link>
  )
}
