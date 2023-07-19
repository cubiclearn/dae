import { useCourse } from '@dae/hooks'
import { createContext, FC, useContext, ReactNode, useMemo } from 'react'
import { Address } from 'viem'
import type { Course } from '@dae/database'

const Context = createContext<
  | {
      data: Course
      isLoading: boolean
      error: Error | undefined
    }
  | undefined
>(undefined)

export const CourseProvider: FC<{
  address: Address
  chainId: number
  children: ReactNode
}> = ({ address, chainId, children }) => {
  const { data, isLoading, error } = useCourse(address, chainId)

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
