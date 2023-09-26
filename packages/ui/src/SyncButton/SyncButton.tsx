import { RepeatIcon } from '@chakra-ui/icons'
import { Button } from '@chakra-ui/react'
import { UseVerifyUserTransactions } from '@dae/wagmi'
import './SyncButton.css'

export const SyncButton = () => {
  const { verify, isLoading } = UseVerifyUserTransactions()

  return (
    <Button
      leftIcon={<RepeatIcon boxSize={6} className={isLoading ? 'spin' : ''} />}
      colorScheme="blue"
      isDisabled={isLoading}
      onClick={verify}
      iconSpacing={0}
      px={3}
    />
  )
}
