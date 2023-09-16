import { RepeatIcon } from '@chakra-ui/icons'
import { Button } from '@chakra-ui/react'
import { UseVerifyUserTransactions } from '@dae/wagmi'

export const ResyncButton = () => {
  const { verify, isLoading } = UseVerifyUserTransactions()

  return (
    <Button
      leftIcon={<RepeatIcon boxSize={6} />}
      colorScheme="blue"
      isLoading={isLoading}
      isDisabled={isLoading}
      onClick={verify}
    >
      Sync
    </Button>
  )
}
