import { FC } from 'react'
import React from 'react'
import { Box, Text, useDisclosure, Stack, Skeleton } from '@chakra-ui/react'
import {
  FiUsers,
  FiZap,
  FiBookOpen,
  FiShield,
  FiCompass,
  FiTrendingUp,
} from 'react-icons/fi'
import { MdOutlinePoll } from 'react-icons/md'
import { useRouter } from 'next/router'
import { Address } from 'viem'
import { CourseProvider } from '../CourseProvider'
import { Web3SafeContainer } from './Web3SafeContainer'
import { NavigationMenu, NavigationMenuItem } from './NavigationMenu'
import { Sidebar } from './SideBar'
import { BaseDrawer } from './Drawer'
import { Header } from './Header'
import { useNetwork } from 'wagmi'
import { useIsAdminOrMagister } from '@dae/wagmi'
import { CourseAddress } from './CourseAddress'

const openedAccorditionIndex = (pathname: string) => {
  if (pathname.startsWith('/course/[address]/credentials')) {
    return 0
  } else if (pathname.startsWith('/course/[address]/teachers')) {
    return 1
  } else if (pathname.startsWith('/course/[address]/students')) {
    return 2
  } else if (pathname.startsWith('/course/[address]/proposals')) {
    return 3
  } else {
    return undefined
  }
}

const CourseNavigationMenu: React.FC = () => {
  const { pathname, query } = useRouter()
  const courseAddress = query.address as Address
  const { data: isAdminOrMagister, isLoading: isFetchingUserRole } =
    useIsAdminOrMagister(courseAddress)

  if (isFetchingUserRole) {
    return (
      <Stack spacing={2} mt={2}>
        <Skeleton height={'56px'} isLoaded={false} rounded={'lg'} />
        <Skeleton height={'56px'} isLoaded={false} rounded={'lg'} />
        <Skeleton height={'56px'} isLoaded={false} rounded={'lg'} />
        <Skeleton height={'56px'} isLoaded={false} rounded={'lg'} />
        <Skeleton height={'56px'} isLoaded={false} rounded={'lg'} />
        <Skeleton height={'56px'} isLoaded={false} rounded={'lg'} />
        <Skeleton height={'56px'} isLoaded={false} rounded={'lg'} />
      </Stack>
    )
  }

  if (isAdminOrMagister) {
    return (
      <NavigationMenu getOpenedAccorditionIndex={openedAccorditionIndex}>
        <NavigationMenuItem
          key={'info'}
          icon={FiBookOpen}
          isActive={pathname === '/course/[address]/info'}
          links={[
            {
              title: 'Info',
              href: `/course/${courseAddress}/info`,
            },
          ]}
          title="Info"
        />
        <NavigationMenuItem
          key={'dashboard'}
          icon={FiTrendingUp}
          isActive={pathname === '/course/[address]/dashboard'}
          links={[
            {
              title: 'Dashboard',
              href: `/course/${courseAddress}/dashboard`,
            },
          ]}
          title="Dashboard"
        />
        <NavigationMenuItem
          title={'Credentials'}
          key={'credentials'}
          icon={FiShield}
          isActive={pathname.startsWith('/course/[address]/credentials')}
          links={[
            {
              title: 'Course Credentials',
              href: `/course/${courseAddress}/credentials/list`,
              active:
                pathname.startsWith('/course/[address]/credentials/list') ||
                pathname.startsWith(
                  '/course/[address]/credentials/[credentialCid]',
                ),
            },
            {
              title: 'My Credentials',
              href: `/course/${courseAddress}/credentials/granted`,
              active: pathname.startsWith(
                '/course/[address]/credentials/granted',
              ),
            },
            {
              title: 'Create',
              href: `/course/${courseAddress}/credentials/create`,
              active: pathname.startsWith(
                '/course/[address]/credentials/create',
              ),
            },
            {
              title: 'Transfer',
              href: `/course/${courseAddress}/credentials/transfer`,
              active: pathname.startsWith(
                '/course/[address]/credentials/transfer',
              ),
            },
          ]}
        />
        <NavigationMenuItem
          title={'Teachers'}
          key={'teachers'}
          icon={FiCompass}
          isActive={pathname.startsWith('/course/[address]/teachers')}
          links={[
            {
              title: 'List',
              href: `/course/${courseAddress}/teachers/list`,
              active: pathname.startsWith('/course/[address]/teachers/list'),
            },
            {
              title: 'Enroll',
              href: `/course/${courseAddress}/teachers/enroll`,
              active: pathname.startsWith('/course/[address]/teachers/enroll'),
            },
          ]}
        />
        <NavigationMenuItem
          title={'Students'}
          key={'students'}
          icon={FiUsers}
          isActive={pathname.startsWith('/course/[address]/students')}
          links={[
            {
              title: 'List',
              href: `/course/${courseAddress}/students/list`,
              active: pathname.startsWith('/course/[address]/students/list'),
            },
            {
              title: 'Enroll',
              href: `/course/${courseAddress}/students/enroll`,
              active: pathname.startsWith('/course/[address]/students/enroll'),
            },
          ]}
        />
        <NavigationMenuItem
          key={'karma'}
          icon={FiZap}
          isActive={pathname.startsWith('/course/[address]/karma')}
          links={[
            {
              title: 'Transfer',
              href: `/course/${courseAddress}/karma/transfer`,
              active: pathname.startsWith('/course/[address]/karma/transfer'),
            },
          ]}
          title="Karma"
        />
        <NavigationMenuItem
          title={'Proposals'}
          key={'proposals'}
          icon={MdOutlinePoll}
          isActive={pathname.startsWith('/course/[address]/proposals')}
          links={[
            {
              title: 'Create',
              href: `/course/${courseAddress}/proposals/create`,
              active: pathname.startsWith('/course/[address]/proposals/create'),
            },
            {
              title: 'Explore',
              href: `/course/${courseAddress}/proposals/explore?status=active`,
              active:
                pathname.startsWith('/course/[address]/proposals/explore') ||
                pathname.startsWith('/course/[address]/proposals/[proposalId]'),
            },
          ]}
        />
      </NavigationMenu>
    )
  }

  return (
    <NavigationMenu getOpenedAccorditionIndex={openedAccorditionIndex}>
      <NavigationMenuItem
        key={'info'}
        icon={FiBookOpen}
        isActive={pathname === '/course/[address]/info'}
        links={[
          {
            title: 'Info',
            href: `/course/${courseAddress}/info`,
          },
        ]}
        title="Info"
      />
      <NavigationMenuItem
        key={'dashboard'}
        icon={FiTrendingUp}
        isActive={pathname === '/course/[address]/dashboard'}
        links={[
          {
            title: 'Dashboard',
            href: `/course/${courseAddress}/dashboard`,
          },
        ]}
        title="Dashboard"
      />
      <NavigationMenuItem
        title={'Credentials'}
        key={'credentials'}
        icon={FiShield}
        isActive={pathname.startsWith('/course/[address]/credentials')}
        links={[
          {
            title: 'My Credentials',
            href: `/course/${courseAddress}/credentials/granted`,
            active: pathname.startsWith(
              '/course/[address]/credentials/granted',
            ),
          },
        ]}
      />
      <NavigationMenuItem
        title={'Proposals'}
        key={'proposals'}
        icon={MdOutlinePoll}
        isActive={pathname.startsWith('/course/[address]/proposals')}
        links={[
          {
            title: 'Explore',
            href: `/course/${courseAddress}/proposals/explore?status=active`,
            active:
              pathname.startsWith('/course/[address]/proposals/explore') ||
              pathname.startsWith('/course/[address]/proposals/[proposalId]'),
          },
        ]}
      />
    </NavigationMenu>
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
    <Box minH="100vh">
      <CourseProvider>
        <Sidebar onClose={onClose}>
          <CourseNavigationMenu />
        </Sidebar>
        <BaseDrawer isOpen={isOpen} onClose={onClose}>
          <CourseNavigationMenu />
        </BaseDrawer>
        <Header
          onOpen={onOpen}
          showDrawerButton={true}
          width={{ md: 'calc(100% - 240px)', base: '100%' }}
          justifyContent={{ base: 'space-between', md: 'flex-end' }}
        />
        <Box
          position={'absolute'}
          top={'80px'}
          width={{ md: 'calc(100% - 240px)', base: '100%' }}
          height={'calc(100% - 80px)'}
          bg={'gray.50'}
          right={0}
          overflow={'auto'}
          p={8}
        >
          <Stack direction="column" mb={8}>
            <Text
              as="h2"
              fontSize={'3xl'}
              fontWeight={'semibold'}
              textTransform={'capitalize'}
            >
              {heading}
            </Text>
            <CourseAddress
              chainId={chain?.id}
              courseAddress={query.address as Address}
            />
          </Stack>
          <Web3SafeContainer>
            <Box>{children}</Box>
          </Web3SafeContainer>
        </Box>
      </CourseProvider>
    </Box>
  )
}
