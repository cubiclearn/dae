import { FC } from 'react'
import React from 'react'
import { ConnectButton } from '../app/header/ConnectButton'
import NextLink from 'next/link'
import {
  IconButton,
  Box,
  CloseButton,
  Flex,
  HStack,
  useColorModeValue,
  Link,
  Drawer,
  DrawerContent,
  Text,
  useDisclosure,
  BoxProps,
  FlexProps,
} from '@chakra-ui/react'
import { FiMenu, FiHome, FiUsers, FiZap, FiBookOpen } from 'react-icons/fi'
import { useRouter } from 'next/router'
import { NavItem } from './DrawerNavItem'
import { Address } from 'viem'
import { CourseProvider } from '../CourseProvider'
import { useNetwork } from 'wagmi'

interface SidebarProps extends BoxProps {
  onClose: () => void
}

const SidebarContent: FC<SidebarProps> = ({ onClose, ...rest }) => {
  const { query, pathname } = useRouter()
  const address = query.address as Address
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
          Course
        </Link>
        <CloseButton display={{ base: 'flex', md: 'none' }} onClick={onClose} />
      </Flex>
      <NavItem
        key={'home'}
        icon={FiHome}
        href={'/'}
        display={{ md: 'none', sm: 'block' }}
      >
        Home
      </NavItem>
      <NavItem
        key={'info'}
        icon={FiBookOpen}
        href={`/course/${address}/info`}
        isActive={pathname === '/course/[address]/info'}
      >
        Info
      </NavItem>
      {/* <NavItem key={'dashboard'} icon={FiHome} href={`#`}>
        Dashboard
      </NavItem> */}
      <NavItem
        key={'students'}
        icon={FiUsers}
        href={`/course/${address}/students/list`}
        isActive={pathname.startsWith('/course/[address]/students')}
      >
        Students
      </NavItem>
      <NavItem
        key={'karma'}
        icon={FiZap}
        href={`/course/${address}/karma/transfer`}
        isActive={pathname.startsWith('/course/[address]/karma')}
      >
        Karma
      </NavItem>
      {/* <NavItem key={'vote'} icon={FiHome} href={`#`}>
        Vote
      </NavItem> */}
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
      width={{ sm: '100%', md: 'calc(100% - 240px)' }}
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

export const CourseLayout: FC<Props> = ({ children, heading }) => {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { query } = useRouter()
  const { chain } = useNetwork()

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
        width={{ sm: '100%', md: 'calc(100% - 240px)' }}
        right={0}
        overflow={'auto'}
        p={8}
      >
        <Box display={'flex'} fontSize={'3xl'} fontWeight={'semibold'} mb={8}>
          <Text as='h2'>{heading}</Text>
        </Box>
        <CourseProvider chainId={chain!.id} address={query.address as Address}>
          <Box>{children}</Box>
        </CourseProvider>
      </Box>
    </Box>
  )
}
