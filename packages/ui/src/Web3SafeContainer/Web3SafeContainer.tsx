import {
  Alert,
  AlertIcon,
  Box,
  AlertTitle,
  AlertDescription,
} from '@chakra-ui/react'
import React from 'react'
import { useAccount } from 'wagmi'

type Web3SafeContainerProps = {
  children: React.ReactNode
}

export const Web3SafeContainer: React.FC<Web3SafeContainerProps> = ({
  children,
}) => {
  const { address } = useAccount()
  if (!address) {
    return (
      <Alert status='info'>
        <AlertIcon />
        <Box>
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>You are not connected to Web3</AlertDescription>
        </Box>
      </Alert>
    )
  }
  return <>{children}</>
}
