import { createContext, FC, useContext, ReactNode, useMemo } from 'react'
import { Address } from 'viem'
import { useCourse } from '@dae/wagmi'
import { useRouter } from 'next/router'
import { Course } from '@dae/database'

const Context = createContext<{
  data: Course | undefined
  isLoading: boolean
  error: Error | undefined
}>({
  data: undefined,
  isLoading: false,
  error: undefined,
})

export const CourseProvider: FC<{
  children: ReactNode
}> = ({ children }) => {
  const router = useRouter()
  const { data, isLoading, error } = useCourse({
    courseAddress: router.query.address as Address,
  })

  const value = useMemo(
    () => ({
      data: data?.course,
      isLoading,
      error,
    }),
    [data, isLoading, error],
  )

  return <Context.Provider value={value}>{children}</Context.Provider>
}

export const useCourseData = () => {
  const context = useContext(Context)
  if (!context) {
    throw new Error('Hook can only be used inside Course Context')
  }

  return context
}
