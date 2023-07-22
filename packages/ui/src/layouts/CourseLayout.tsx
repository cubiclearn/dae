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
} from '@chakra-ui/react'
import { FiMenu, FiUsers, FiZap, FiBookOpen, FiShield } from 'react-icons/fi'
import { MdOutlinePoll } from 'react-icons/md'
import { useRouter } from 'next/router'
import { NavItemSimple, NavItemDropdown } from './DrawerNavItem'
import { Address } from 'viem'
import { CourseProvider } from '../CourseProvider'
import { Logo } from './Logo'
import { Web3SafeContainer } from '../Web3SafeContainer'

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
        <Logo />
        <CloseButton display={{ base: 'flex', md: 'none' }} onClick={onClose} />
      </Flex>
      <Accordion allowToggle>
        <NavItemSimple
          key={'info'}
          icon={FiBookOpen}
          isActive={pathname === '/course/[address]/info'}
          link={{ title: 'Info', href: `/course/${address}/info` }}
        />
        <NavItemDropdown
          title={'Credentials'}
          key={'credentials'}
          icon={FiShield}
          isActive={pathname.startsWith('/course/[address]/credentials')}
          links={[
            {
              title: 'Course Credentials',
              href: `/course/${address}/credentials/list`,
            },
            {
              title: 'My Credentials',
              href: `/course/${address}/credentials/granted`,
            },
            {
              title: 'Create',
              href: `/course/${address}/credentials/create`,
            },
          ]}
        />
        <NavItemDropdown
          title={'Students'}
          key={'students'}
          icon={FiUsers}
          isActive={pathname.startsWith('/course/[address]/students')}
          links={[
            { title: 'List', href: `/course/${address}/students/list` },
            { title: 'Enroll', href: `/course/${address}/students/enroll` },
          ]}
        />
        <NavItemSimple
          key={'karma'}
          icon={FiZap}
          isActive={pathname.startsWith('/course/[address]/karma')}
          link={{ title: 'Karma', href: `/course/${address}/karma/transfer` }}
        />
        <NavItemDropdown
          title={'Proposals'}
          key={'proposals'}
          icon={MdOutlinePoll}
          isActive={pathname.startsWith('/course/[address]/proposals')}
          links={[
            {
              title: 'Explore',
              href: `/course/${address}/proposals/explore?active=true`,
            },
            { title: 'Create', href: `/course/${address}/proposals/create` },
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
        <Web3SafeContainer>
          <CourseProvider>
            <Box>{children}</Box>
          </CourseProvider>
        </Web3SafeContainer>
      </Box>
    </Box>
  )
}
