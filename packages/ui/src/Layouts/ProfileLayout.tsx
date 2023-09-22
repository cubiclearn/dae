import { FC } from 'react'
import React from 'react'
import { Box, Text, useDisclosure, Stack } from '@chakra-ui/react'
import { FiBook } from 'react-icons/fi'
import { useRouter } from 'next/router'
import { Web3SafeContainer } from './Web3SafeContainer'
import { Header } from './Header'
import { BaseDrawer } from './Drawer'
import { NavigationMenu, NavigationMenuItem } from './NavigationMenu'
import { Sidebar } from './SideBar'

const openedAccorditionIndex = (pathname: string) => {
  if (pathname.startsWith('/profile/courses')) {
    return 0
  } else {
    return undefined
  }
}

const ProfileNavigationMenu: React.FC = () => {
  const { pathname } = useRouter()
  return (
    <NavigationMenu getOpenedAccorditionIndex={openedAccorditionIndex}>
      <NavigationMenuItem
        title={'My Courses'}
        key={'students'}
        icon={FiBook}
        isActive={pathname.startsWith('/profile/courses')}
        links={[
          {
            title: 'Create',
            href: '/profile/courses/create',
            active: pathname.startsWith('/profile/courses/create'),
          },
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
        ]}
      />
    </NavigationMenu>
  )
}

type Props = {
  children?: React.ReactNode
  heading: string
}

export const ProfileLayout: FC<Props> = ({ children, heading }) => {
  const { isOpen, onOpen, onClose } = useDisclosure()

  return (
    <Box minH="100vh">
      <Sidebar onClose={onClose}>
        <ProfileNavigationMenu />
      </Sidebar>
      <BaseDrawer isOpen={isOpen} onClose={onClose}>
        <ProfileNavigationMenu />
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
        right={0}
        overflow={'auto'}
        p={8}
        height={'calc(100% - 80px)'}
        bg={'gray.50'}
      >
        <Stack display={'flex'} fontSize={'3xl'} fontWeight={'semibold'} mb={8}>
          <Text as="h2" fontSize={'3xl'} textTransform={'capitalize'}>
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
