import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Box,
  Center,
  SimpleGrid,
  Spinner,
} from '@chakra-ui/react'
import { useKarmaBalance } from '@dae/wagmi'
import { Address } from 'viem'
import { DashboardBlock } from '../DashboardBlock'
import { useAccount } from 'wagmi'

type MyKarmaSectionProps = {
  karmaAccessControlAddress: Address | undefined
}

export const MyKarmaSection: React.FC<MyKarmaSectionProps> = ({
  karmaAccessControlAddress,
}) => {
  const { address } = useAccount()
  const {
    data: karmaBalance,
    isLoading,
    error,
  } = useKarmaBalance(karmaAccessControlAddress, address)

  if (isLoading) {
    return (
      <Center>
        <Spinner />
      </Center>
    )
  }

  if (error) {
    return (
      <Alert status="info">
        <AlertIcon />
        <Box>
          <AlertTitle>Something went wrong.</AlertTitle>
          <AlertDescription>{error.message}</AlertDescription>
        </Box>
      </Alert>
    )
  }

  return (
    <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 5 }} spacing={4}>
      <DashboardBlock
        title="Karma"
        value={Number(karmaBalance) ?? '--'}
        isInt={true}
      />
    </SimpleGrid>
  )
}
