import { FC } from 'react'
import { ConnectButton as RainbowConnectButton } from '@rainbow-me/rainbowkit'
import { Address, useDisconnect } from 'wagmi'
import { useRouter } from 'next/router'
import { Avatar } from '../../Avatar'
import {
  Box,
  Button,
  Flex,
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuList,
  Text,
  Image,
} from '@chakra-ui/react'

export const ConnectButton: FC = (_props) => {
  const { disconnect } = useDisconnect({
    onSuccess(_data) {
      router.push('/', undefined, { shallow: false })
    },
  })
  const router = useRouter()
  const handleDisconnect = () => {
    disconnect()
  }

  return (
    <RainbowConnectButton.Custom>
      {({
        account,
        chain,
        openChainModal,
        openConnectModal,
        authenticationStatus,
        mounted,
      }) => {
        // Note: If your app doesn't use authentication, you
        // can remove all 'authenticationStatus' checks

        const ready = mounted && authenticationStatus !== 'loading'
        const connected =
          ready &&
          account &&
          chain &&
          (!authenticationStatus || authenticationStatus === 'authenticated')

        return (
          <Box
            {...(!ready && {
              'aria-hidden': true,
              style: {
                opacity: 0,
                pointerEvents: 'none',
                userSelect: 'none',
              },
            })}
          >
            {(() => {
              if (!connected) {
                return (
                  <Button
                    onClick={openConnectModal}
                    rounded={'xl'}
                    fontWeight={'semibold'}
                    textColor={'gray.800'}
                  >
                    Connect Wallet
                  </Button>
                )
              }

              if (chain.unsupported) {
                return <Button onClick={openChainModal}>Wrong network</Button>
              }

              return (
                <Flex className="flex gap-5">
                  <Button
                    onClick={openChainModal}
                    fontSize={'md'}
                    fontWeight={'semibold'}
                    bg={'white'}
                    _hover={{
                      textDecoration: 'none',
                    }}
                  >
                    {chain.hasIcon && (
                      <Box
                        width={6}
                        height={6}
                        rounded={'full'}
                        marginRight={2}
                        bg={chain.iconBackground}
                      >
                        {chain.iconUrl && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <Image
                            alt={chain.name ?? 'Chain icon'}
                            src={chain.iconUrl}
                            width={6}
                            height={6}
                          />
                        )}
                      </Box>
                    )}
                    {chain.name}
                  </Button>
                  <Flex alignItems={'center'}>
                    <Menu>
                      <MenuButton
                        as={Button}
                        rounded={'full'}
                        variant={'link'}
                        cursor={'pointer'}
                        minW={0}
                      >
                        <Avatar address={account.address as Address} />
                      </MenuButton>
                      <MenuList>
                        <Flex
                          justify={'center'}
                          align={'center'}
                          direction={'column'}
                        >
                          <Text fontSize={'sm'}>Address:</Text>
                          <Text fontSize={'lg'} fontWeight={'semibold'}>
                            {account.displayName}
                          </Text>
                        </Flex>
                        <MenuDivider />
                        {/* <MenuItem onClick={() => router.push('/profile')}>Profile</MenuItem> */}
                        <MenuItem
                          onClick={() =>
                            router.push('/profile/courses/teaching')
                          }
                        >
                          My Courses
                        </MenuItem>
                        <MenuItem
                          onClick={() => router.push('/profile/courses/create')}
                        >
                          Create Course
                        </MenuItem>
                        <MenuDivider />
                        <MenuItem onClick={handleDisconnect}>Sign Out</MenuItem>
                      </MenuList>
                    </Menu>
                  </Flex>
                </Flex>
              )
            })()}
          </Box>
        )
      }}
    </RainbowConnectButton.Custom>
  )
}
