import { createContext, FC, useContext, ReactNode, useMemo } from 'react'
import { Address } from 'viem'
import { useCourse } from '@dae/wagmi' // Assuming this is a valid import
import { useNetwork } from 'wagmi' // Assuming this is a valid import
import { useRouter } from 'next/router'
import { Course } from '@dae/database'

const Context = createContext<{
  data:
    | (Omit<Course, 'address' | 'karma_access_control_address'> & {
        address: Address
        karma_access_control_address: Address
      })
    | null
  isLoading: boolean
  error: Error | undefined
}>({
  data: null,
  isLoading: false,
  error: undefined,
})

export const CourseProvider: FC<{
  children: ReactNode
}> = ({ children }) => {
  const { chain } = useNetwork()
  const router = useRouter()
  const { data, isLoading, error } = useCourse(
    router.query.address as Address,
    chain?.id,
  )

  const courseData = data?.course
    ? {
        ...data.course,
        address: data.course.address as Address,
        karma_access_control_address: data.course
          .karma_access_control_address as Address,
      }
    : null

  return (
    <Context.Provider
      value={useMemo(
        () => ({
          data: courseData,
          isLoading,
          error,
        }),
        [courseData, isLoading, error],
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
