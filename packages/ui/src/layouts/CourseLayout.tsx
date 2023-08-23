import { FC, useMemo } from 'react'
import React from 'react'
import {
  Box,
  Text,
  useDisclosure,
  Stack,
  Link,
  Skeleton,
} from '@chakra-ui/react'
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
import { Web3SafeContainer } from '../Web3SafeContainer'
import NextLink from 'next/link'
import { NavigationMenu, NavigationMenuItem } from './NavigationMenu'
import { Sidebar } from './SideBar'
import { BaseDrawer } from './Drawer'
import { Header } from './Header'
import { ChainBlockExplorer } from '@dae/chains'
import { useNetwork } from 'wagmi'
import { useUserCourseCredentials } from '@dae/wagmi'

const openedAccorditionIndex = (pathname: string) => {
  if (pathname.startsWith('/course/[address]/credentials')) {
    return 0
  } else if (pathname.startsWith('/course/[address]/teachers')) {
    return 1
  } else if (pathname.startsWith('/course/[address]/students')) {
    return 2
  } else if (pathname.startsWith('/course/[address]/karma')) {
    return 3
  } else if (pathname.startsWith('/course/[address]/proposals')) {
    return 4
  } else {
    return undefined
  }
}

const CourseNavigationMenu: React.FC = () => {
  const { pathname, query } = useRouter()
  const { chain } = useNetwork()
  const courseAddress = query.address as Address
  const { data, isLoading } = useUserCourseCredentials(courseAddress, chain?.id)

  const isAdminOrMagister = useMemo(
    () =>
      !data
        ? false
        : data.some(
            (item) => item.type === 'MAGISTER' || item.type === 'ADMIN',
          ),
    [data],
  )

  return (
    <NavigationMenu getOpenedAccorditionIndex={openedAccorditionIndex}>
      <Skeleton isLoaded={!isLoading} rounded={'lg'}>
        <NavigationMenuItem
          key={'info'}
          icon={FiBookOpen}
          isActive={pathname === '/course/[address]/info'}
          links={[
            {
              title: 'Info',
              href: `/course/${courseAddress}/info`,
              visible: true,
            },
          ]}
          title="Info"
          visible={true}
        />
      </Skeleton>
      <Skeleton isLoaded={!isLoading} rounded={'lg'}>
        <NavigationMenuItem
          key={'dashboard'}
          icon={FiTrendingUp}
          isActive={pathname === '/course/[address]/dashboard'}
          links={[
            {
              title: 'Dashboard',
              href: `/course/${courseAddress}/dashboard`,
              visible: isAdminOrMagister,
            },
          ]}
          title="Dashboard"
          visible={isAdminOrMagister}
        />
      </Skeleton>
      <Skeleton isLoaded={!isLoading} rounded={'lg'}>
        <NavigationMenuItem
          title={'Credentials'}
          key={'credentials'}
          icon={FiShield}
          isActive={pathname.startsWith('/course/[address]/credentials')}
          visible={true}
          links={[
            {
              title: 'Course Credentials',
              href: `/course/${courseAddress}/credentials/list`,
              active: pathname.startsWith('/course/[address]/credentials/list'),
              visible: isAdminOrMagister,
            },
            {
              title: 'My Credentials',
              href: `/course/${courseAddress}/credentials/granted`,
              active: pathname.startsWith(
                '/course/[address]/credentials/granted',
              ),
              visible: true,
            },
            {
              title: 'Create',
              href: `/course/${courseAddress}/credentials/create`,
              active: pathname.startsWith(
                '/course/[address]/credentials/create',
              ),
              visible: isAdminOrMagister,
            },
            {
              title: 'Transfer',
              href: `/course/${courseAddress}/credentials/transfer`,
              active: pathname.startsWith(
                '/course/[address]/credentials/transfer',
              ),
              visible: isAdminOrMagister,
            },
          ]}
        />
      </Skeleton>
      <Skeleton isLoaded={!isLoading} rounded={'lg'}>
        <NavigationMenuItem
          title={'Teachers'}
          key={'teachers'}
          icon={FiCompass}
          isActive={pathname.startsWith('/course/[address]/teachers')}
          visible={isAdminOrMagister}
          links={[
            {
              title: 'List',
              href: `/course/${courseAddress}/teachers/list`,
              active: pathname.startsWith('/course/[address]/teachers/list'),
              visible: isAdminOrMagister,
            },
            {
              title: 'Enroll',
              href: `/course/${courseAddress}/teachers/enroll`,
              active: pathname.startsWith('/course/[address]/teachers/enroll'),
              visible: isAdminOrMagister,
            },
          ]}
        />
      </Skeleton>
      <Skeleton isLoaded={!isLoading} rounded={'lg'}>
        <NavigationMenuItem
          title={'Students'}
          key={'students'}
          icon={FiUsers}
          isActive={pathname.startsWith('/course/[address]/students')}
          visible={isAdminOrMagister}
          links={[
            {
              title: 'List',
              href: `/course/${courseAddress}/students/list`,
              active: pathname.startsWith('/course/[address]/students/list'),
              visible: isAdminOrMagister,
            },
            {
              title: 'Enroll',
              href: `/course/${courseAddress}/students/enroll`,
              active: pathname.startsWith('/course/[address]/students/enroll'),
              visible: isAdminOrMagister,
            },
          ]}
        />
      </Skeleton>
      <Skeleton isLoaded={!isLoading} rounded={'lg'}>
        <NavigationMenuItem
          key={'karma'}
          icon={FiZap}
          isActive={pathname.startsWith('/course/[address]/karma')}
          visible={true}
          links={[
            {
              title: 'Transfer',
              href: `/course/${courseAddress}/karma/transfer`,
              active: pathname.startsWith('/course/[address]/karma/transfer'),
              visible: isAdminOrMagister,
            },
            {
              title: 'My Karma',
              href: `/course/${courseAddress}/karma/rating`,
              active: pathname.startsWith('/course/[address]/karma/rating'),
              visible: true,
            },
          ]}
          title="Karma"
        />
      </Skeleton>
      <Skeleton isLoaded={!isLoading} rounded={'lg'}>
        <NavigationMenuItem
          title={'Proposals'}
          key={'proposals'}
          icon={MdOutlinePoll}
          isActive={pathname.startsWith('/course/[address]/proposals')}
          visible={true}
          links={[
            {
              title: 'Create',
              href: `/course/${courseAddress}/proposals/create`,
              active: pathname.startsWith('/course/[address]/proposals/create'),
              visible: isAdminOrMagister,
            },
            {
              title: 'Explore',
              href: `/course/${courseAddress}/proposals/explore?active=true`,
              active: pathname.startsWith(
                '/course/[address]/proposals/explore',
              ),
              visible: true,
            },
          ]}
        />
      </Skeleton>
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
            <Text>
              Course:{' '}
              <Link
                as={NextLink}
                href={`${
                  ChainBlockExplorer[chain?.id as keyof ChainBlockExplorer]
                }/address/${query.address}`}
                textDecoration={'none'}
                target="_blank"
              >
                {query.address}
              </Link>
            </Text>
          </Stack>
          <Web3SafeContainer>
            <Box>{children}</Box>
          </Web3SafeContainer>
        </Box>
      </CourseProvider>
    </Box>
  )
}
