import { FC } from 'react'
import React from 'react'
import { ConnectButton } from '../app/header/ConnectButton'
import {
  IconButton,
  Box,
  CloseButton,
  Flex,
  HStack,
  useColorModeValue,
  Drawer,
  DrawerContent,
  Text,
  useDisclosure,
  BoxProps,
  FlexProps,
  Accordion,
  Stack,
} from '@chakra-ui/react'
import { FiBook, FiMenu } from 'react-icons/fi'
import { NavItemDropdown } from './DrawerNavItem'
import { useRouter } from 'next/router'
import { Logo } from './Logo'
import { Web3SafeContainer } from '../Web3SafeContainer'

interface SidebarProps extends BoxProps {
  onClose: () => void
}

const openedAccorditionIndex = (pathname: string) => {
  if (pathname.startsWith('/profile/courses')) {
    return 0
  } else {
    return undefined
  }
}

const SidebarContent: FC<SidebarProps> = ({ onClose, ...rest }) => {
  const { pathname } = useRouter()
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
        <Logo />
        <CloseButton display={{ base: 'flex', md: 'none' }} onClick={onClose} />
      </Flex>
      <Accordion allowToggle defaultIndex={openedAccorditionIndex(pathname)}>
        <NavItemDropdown
          title={'My Courses'}
          key={'students'}
          icon={FiBook}
          isActive={pathname.startsWith('/profile/courses')}
          links={[
            {
              title: 'Teaching',
              href: '/profile/courses/teaching',
              active: pathname.startsWith('/profile/courses/teaching'),
            },
            {
              title: 'Partecipating',
              href: '/profile/courses/partecipating',
              active: pathname.startsWith('/profile/courses/partecipating'),
            },
            {
              title: 'Create',
              href: '/profile/courses/create',
              active: pathname.startsWith('/profile/courses/create'),
            },
          ]}
        />
      </Accordion>
    </Box>
  )
}

interface HeaderProps extends FlexProps {
  onOpen: () => void
}
export const Header: FC<HeaderProps> = ({ onOpen, ...rest }) => {
  return (
    <Flex
      px={{ base: 4, md: 8 }}
      height='20'
      alignItems='center'
      bg={useColorModeValue('white', 'gray.900')}
      borderBottomWidth='1px'
      borderBottomColor={useColorModeValue('gray.200', 'gray.700')}
      justifyContent={{ base: 'space-between', md: 'flex-end' }}
      as='header'
      position={'fixed'}
      right={0}
      zIndex={'sticky'}
      width={{ md: 'calc(100% - 240px)', base: '100%' }}
      {...rest}
    >
      <IconButton
        display={{ base: 'flex', md: 'none' }}
        onClick={onOpen}
        variant='outline'
        aria-label='open menu'
        icon={<FiMenu />}
      />
      <HStack spacing={{ base: '0', md: '6' }}>
        <Flex alignItems={'center'}>
          <ConnectButton />
        </Flex>
      </HStack>
    </Flex>
  )
}

type Props = {
  children?: React.ReactNode
  heading: string
}

export const ProfileLayout: FC<Props> = ({ children, heading }) => {
  const { isOpen, onOpen, onClose } = useDisclosure()

  return (
    <Box minH='100vh'>
      <SidebarContent
        onClose={() => onClose}
        display={{ base: 'none', md: 'block' }}
      />
      <Drawer
        autoFocus={false}
        isOpen={isOpen}
        placement='left'
        onClose={onClose}
        returnFocusOnClose={false}
        onOverlayClick={onClose}
        size='xs'
      >
        <DrawerContent>
          <SidebarContent onClose={onClose} />
        </DrawerContent>
      </Drawer>
      <Header onOpen={onOpen} as='header' />
      <Box
        position={'absolute'}
        top={'80px'}
        width={{ md: 'calc(100% - 240px)', base: '100%' }}
        right={0}
        overflow={'auto'}
        p={8}
        height={'calc(100% - 80px)'}
        bg={'gray.50'}
      >
        <Stack display={'flex'} fontSize={'3xl'} fontWeight={'semibold'} mb={8}>
          <Text as='h2' fontSize={'3xl'} textTransform={'capitalize'}>
            {heading}
          </Text>
        </Stack>
        <Web3SafeContainer>
          <Box>{children}</Box>
        </Web3SafeContainer>
      </Box>
    </Box>
  )
}
