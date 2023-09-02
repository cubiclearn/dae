import { useState } from 'react'
import { ContractFunctionExecutionError, TransactionExecutionError } from 'viem'

export function useWeb3HookState() {
  const [state, setState] = useState({
    error: null,
    isError: false,
    isSuccess: false,
    isLoading: false,
    isSigning: false,
    isValidating: false,
  })

  const setValidating = () =>
    setState({
      ...state,
      error: null,
      isError: false,
      isSuccess: false,
      isLoading: false,
      isSigning: false,
      isValidating: true,
    })

  const setSigning = () =>
    setState({
      ...state,
      isError: false,
      isSuccess: false,
      isSigning: true,
      isValidating: false,
    })

  const setLoading = () =>
    setState({
      ...state,
      isError: false,
      isSuccess: false,
      isSigning: false,
      isLoading: true,
      isValidating: false,
    })

  const handleError = (error: any) => {
    let errorMessage
    switch (true) {
      case error instanceof ContractFunctionExecutionError:
        errorMessage = error.details
        break
      case error instanceof TransactionExecutionError:
        errorMessage = error.details
        break
      default:
        errorMessage = error.message || 'An error occurred'
    }

    setState({
      ...state,
      isError: true,
      isLoading: false,
      isSigning: false,
      error: errorMessage,
    })
  }

  const setSuccess = () =>
    setState({
      ...state,
      isError: false,
      isLoading: false,
      isSuccess: true,
      isValidating: false,
    })

  return {
    ...state,
    setValidating,
    setSigning,
    setLoading,
    setSuccess,
    handleError,
  }
}
