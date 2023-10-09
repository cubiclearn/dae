import { useEffect } from 'react'

export const useLeavePageConfirmation = (
  shouldPreventLeaving: boolean,
  message: string,
) => {
  useEffect(() => {
    if (shouldPreventLeaving) {
      window.onbeforeunload = () => ''
    } else {
      window.onbeforeunload = null
    }

    return () => {
      window.onbeforeunload = null
    }
  }, [shouldPreventLeaving, message])
}
