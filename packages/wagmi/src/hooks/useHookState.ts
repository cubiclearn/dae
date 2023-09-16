import { useState } from 'react'

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

  const handleError = (error: unknown) => {
    let parsedError: Error
    switch (true) {
      case error instanceof Error:
        parsedError = error as Error
        break
      default:
        parsedError = new Error('An error occurred')
    }
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
