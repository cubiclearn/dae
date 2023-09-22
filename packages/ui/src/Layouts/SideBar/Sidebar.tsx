import React, { FC } from 'react'
import { Logo } from '../Logo'
import { Box, CloseButton, useColorModeValue, Stack } from '@chakra-ui/react'

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
      bg={useColorModeValue('white', 'gray.900')}
      borderRight="1px"
      borderRightColor={useColorModeValue('gray.200', 'gray.700')}
      w={{ base: 'full', md: 60 }}
      pos="fixed"
      h="full"
      px={4}
      {...rest}
    >
      <Stack spacing={6} pt={8}>
        <Box alignItems="center" mx="2" justifyContent="space-between">
          <Logo />
          <CloseButton
            display={{ base: 'flex', md: 'none' }}
            onClick={onClose}
          />
        </Box>
        <Box>{children}</Box>
      </Stack>
    </Box>
  )
}
