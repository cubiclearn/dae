import { useCourse } from '@dae/wagmi'
import { createContext, FC, useContext, ReactNode, useMemo } from 'react'
import { Address } from 'viem'
import type { Course } from '@dae/database'
import { useNetwork } from 'wagmi'
import { useRouter } from 'next/router'

const Context = createContext<
  | {
      data: Course | null
      isLoading: boolean
      error: Error | null
    }
  | undefined
>(undefined)

export const CourseProvider: FC<{
  children: ReactNode
}> = ({ children }) => {
  const { chain } = useNetwork()
  const router = useRouter()
  const { data, isLoading, error } = useCourse(
    router.query.address as Address,
    chain?.id,
  )

  return (
    <Context.Provider
      value={useMemo(
        () => ({
          data,
          isLoading,
          error,
        }),
        [data, isLoading, error],
      )}
    >
      {children}
    </Context.Provider>
  )
}

export const useCourseData = () => {
  const context = useContext(Context)
  if (!context) {
    throw new Error('Hook can only be used inside Course Context')
  }

  return context
}
