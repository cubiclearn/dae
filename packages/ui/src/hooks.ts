import { useToast } from '@chakra-ui/react'
import { useEffect } from 'react'

export const useFormFeedback = (props: {
  isError: boolean
  isSuccess: boolean
  isLoading: boolean
}) => {
  const toast = useToast()
  const { isError, isSuccess, isLoading } = props

  useEffect(() => {
    if (isError) {
      toast({
        title: 'Error transferring credential.',
        status: 'error',
      })
    }
    if (isSuccess) {
      toast({
        title: 'Credential transferred with success!',
        status: 'success',
      })
    }
    if (isLoading) {
      toast({
        title: 'Transferring selected credential...',
        status: 'info',
      })
    }
  }, [isLoading, isError, isSuccess])
}
