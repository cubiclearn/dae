import { FC } from 'react'
import { Box } from '@chakra-ui/react'
import { Header } from './Header'
import { IconType } from 'react-icons'
import { Footer } from './Footer'

type NavItemChildProps = {
  name: string
  icon: IconType
  href: string
}

type Props = {
  children: React.ReactNode
  navItems?: NavItemChildProps[]
}

export const PageLayout: FC<Props> = ({ children }): JSX.Element => {
  return (
    <main
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
      }}
    >
      <Box height={'80px'} w="full">
        <Header
          onOpen={() => {}}
          showDrawerButton={false}
          width={{ base: '100%' }}
          justifyContent={{ base: 'space-between' }}
        />
      </Box>
      <Box
        flex="1"
        overflowY={{ base: 'auto', md: 'hidden' }}
        position={{ base: 'static', md: 'relative' }}
        w="full"
        height={'calc(100% - 160px)'}
      >
        <Box>{children}</Box>
      </Box>
      <Box
        height={'80px'}
        borderTop={'1px solid'}
        borderColor={'gray.200'}
        position={{ base: 'static', md: 'fixed' }}
        bottom={{ base: 'unset', md: '0' }}
        w="full"
      >
        <Footer />
      </Box>
    </main>
  )
}
