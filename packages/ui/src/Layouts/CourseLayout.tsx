import React from 'react'
import { Box, Text, useDisclosure, Stack } from '@chakra-ui/react'
import { useRouter } from 'next/router'
import { Address } from 'viem'
import { CourseProvider } from '../CourseProvider'
import { Web3SafeContainer } from './Web3SafeContainer'
import { Sidebar } from './SideBar'
import { BaseDrawer } from './Drawer'
import { Header } from './Header'
import { useNetwork } from 'wagmi'
import { useIsAdmin, useIsMagister } from '@dae/wagmi'
import { CourseAddress } from './CourseAddress'
import { renderNavigationMenu } from './NavigationMenu/NavigationMenu'
import { CourseMenuItems } from './NavigationMenu'

const CourseNavigationMenu: React.FC = () => {
  const { query } = useRouter()
  const courseAddress = query.address as Address
  const { data: isAdmin, isLoading: isLoadingAdminState } = useIsAdmin({
    courseAddress,
  })
  const { data: isMagister, isLoading: isLoadingMagisterState } = useIsMagister(
    { courseAddress },
  )

  return renderNavigationMenu({
    menuItems: CourseMenuItems,
    userPermissions: isAdmin ? ['admin'] : isMagister ? ['magister'] : [],
    params: { courseAddress },
    isLoading: isLoadingAdminState || isLoadingMagisterState,
  })
}

export const CourseLayout: React.FC<{
  children?: React.ReactNode
  heading: string
}> = ({ children, heading }) => {
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
          <Web3SafeContainer>{children}</Web3SafeContainer>
        </Box>
      </CourseProvider>
    </Box>
  )
}
