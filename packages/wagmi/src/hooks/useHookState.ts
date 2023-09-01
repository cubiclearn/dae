import { useState } from 'react'
import { ContractFunctionExecutionError } from 'viem'

export function useHookState() {
  const [state, setState] = useState({
    error: null,
    isError: false,
    isSuccess: false,
    isLoading: false,
    isValidating: false,
  })

  const setValidating = () =>
    setState({
      ...state,
      error: null,
      isError: false,
      isSuccess: false,
      isLoading: false,
      isValidating: true,
    })

  const setLoading = () =>
    setState({
      ...state,
      isError: false,
      isSuccess: false,
      isLoading: true,
      isValidating: false,
    })

  const handleError = (error: any) => {
    const errorMessage =
      error instanceof ContractFunctionExecutionError
        ? error.details
        : error.message || 'An error occurred'

    setState({
      ...state,
      isError: true,
      isLoading: false,
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
    setLoading,
    setSuccess,
    handleError,
  }
}
