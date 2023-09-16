import { useState } from 'react'
import { ContractFunctionExecutionError, TransactionExecutionError } from 'viem'

type Web3HookState = {
  error: Error | null
  isError: boolean
  isSuccess: boolean
  isLoading: boolean
  isSigning: boolean
  isValidating: boolean
}

export function useWeb3HookState() {
  const [state, setState] = useState<Web3HookState>({
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

  const handleError = (error: unknown) => {
    let parsedError: Error
    switch (true) {
      case error instanceof ContractFunctionExecutionError:
        parsedError = error as ContractFunctionExecutionError
        break
      case error instanceof TransactionExecutionError:
        parsedError = error as TransactionExecutionError
        break
      case error instanceof Error:
        parsedError = error as Error
        break
      default:
        parsedError = new Error('An error occurred')
    }

    setState({
      ...state,
      isError: true,
      isLoading: false,
      isSigning: false,
      error: parsedError,
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
