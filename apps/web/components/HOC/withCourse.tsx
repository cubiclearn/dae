import { useRouter } from 'next/router'
import { Address } from 'viem'
import { useCourse } from '@dae/wagmi'
import { FC } from 'react'
import { BouncingDotsLoader } from '@dae/ui'

const withCourse = (WrappedComponent: FC) => {
  const ProtectedPage: FC = (props) => {
    const router = useRouter()
    const courseAddress = router.query.address as Address

    const { data: courseData, isLoading: isLoadingCourseData } = useCourse({
      courseAddress,
    })

    if (isLoadingCourseData) {
      return <BouncingDotsLoader />
    }

    if (!isLoadingCourseData && !courseData) {
      router.push('/404')
      return null
    }

    return <WrappedComponent {...props} />
  }

  return ProtectedPage
}

export default withCourse
