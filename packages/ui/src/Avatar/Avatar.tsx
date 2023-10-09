import { Avatar as ChackraAvatar } from '@chakra-ui/react'
import React from 'react'
import { Address } from 'wagmi'
import Jazzicon, { jsNumberForAddress } from 'react-jazzicon'

type AvatarProps = {
  address: Address
}

export const Avatar: React.FC<AvatarProps> = ({ address }) => {
  return (
    <ChackraAvatar
      size={'sm'}
      opacity={0.8}
      icon={<Jazzicon diameter={32} seed={jsNumberForAddress(address)} />}
    />
  )
}
