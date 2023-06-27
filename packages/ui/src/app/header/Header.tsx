import { Flex, useColorModeValue, HStack, IconButton } from '@chakra-ui/react'
import { ConnectButton } from './ConnectButton'
import { FC } from 'react'
import { FiMenu } from 'react-icons/fi'
import { Logo } from '../../layouts'

type HeaderProps = {
  onOpen: () => void
  showDrawerButton: boolean
}

export const Header: FC<HeaderProps> = ({
  onOpen,
  showDrawerButton,
  ...rest
}): JSX.Element => {
  return (
    <Flex
      px={{ base: 4, md: 8 }}
      height='20'
      alignItems='center'
      bg={useColorModeValue('white', 'gray.900')}
      borderBottomWidth='1px'
      borderBottomColor={useColorModeValue('gray.200', 'gray.700')}
      justifyContent={{
        base: showDrawerButton ? 'space-between' : 'flex-end',
        md: 'space-between',
      }}
      as='header'
      position={'fixed'}
      right={0}
      zIndex={'sticky'}
      width={'100%'}
      top={'0'}
      {...rest}
    >
      <IconButton
        display={{ base: showDrawerButton ? 'block' : 'none', md: 'none' }}
        alignSelf={'flex-end'}
        onClick={onOpen}
        variant='outline'
        aria-label='open menu'
        icon={<FiMenu />}
      />
      <Logo />

      {/* <SearchBar /> */}

      <HStack spacing={{ base: '0', md: '6' }}>
        <Flex alignItems={'center'}>
          <ConnectButton />
        </Flex>
      </HStack>
    </Flex>
  )
}
