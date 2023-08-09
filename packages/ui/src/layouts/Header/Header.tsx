import { Flex, IconButton, HStack } from '@chakra-ui/react'
import { useColorModeValue } from '@chakra-ui/system'
import { ConnectButton } from './ConnectButton'
import { FC } from 'react'
import { FiMenu } from 'react-icons/fi'
import { Logo } from '../Logo'

type HeaderProps = {
  onOpen: () => void
  showDrawerButton: boolean
}

export const Header: FC<HeaderProps> = ({
  onOpen,
  showDrawerButton,
  ...rest
}) => {
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
      {showDrawerButton ? (
        <IconButton
          display={{ base: 'flex', md: 'none' }}
          onClick={onOpen}
          variant='outline'
          aria-label='open menu'
          icon={<FiMenu />}
        />
      ) : (
        <Logo />
      )}
      <HStack spacing={{ base: '0', md: '6' }}>
        <Flex alignItems={'center'}>
          <ConnectButton />
        </Flex>
      </HStack>
    </Flex>
  )
}