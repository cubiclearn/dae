import React, { FC } from 'react'
import NextLink from 'next/link'
import {
  Box,
  CloseButton,
  Flex,
  useColorModeValue,
  Link,
} from '@chakra-ui/react'

type SidebarProps = {
  children: React.ReactNode
  onClose: () => void
}

export const Sidebar: FC<SidebarProps> = ({
  onClose,
  children,
  ...rest
}): JSX.Element => {
  return (
    <Box
      transition='3s ease'
      bg={useColorModeValue('white', 'gray.900')}
      borderRight='1px'
      borderRightColor={useColorModeValue('gray.200', 'gray.700')}
      w={{ base: 'full', md: 60 }}
      pos='fixed'
      h='full'
      {...rest}
    >
      <Flex h='20' alignItems='center' mx='8' justifyContent='space-between'>
        <Link
          as={NextLink}
          px={2}
          py={1}
          rounded={'md'}
          fontWeight={500}
          fontSize={20}
          _hover={{
            textDecoration: 'none',
          }}
          href={'/'}
        >
          Profile
        </Link>
        <CloseButton display={{ base: 'flex', md: 'none' }} onClick={onClose} />
      </Flex>
      <Box>{children}</Box>
    </Box>
  )
}
