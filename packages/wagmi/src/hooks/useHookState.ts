import { useState } from 'react'

type HookState = {
  error: Error | null
  isError: boolean
  isSuccess: boolean
  isLoading: boolean
  isValidating: boolean
}

export function useHookState() {
  const [state, setState] = useState<HookState>({
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
      error: null,
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
    setState({
      ...state,
      isSuccess: false,
      isError: true,
      isLoading: false,
      error: parsedError,
      isValidating: false,
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
