import { useRouter } from 'next/router'
import { Address } from 'viem'
import { useCourse, useHasAccess, useIsAdmin, useIsMagister } from '@dae/wagmi'
import { FC } from 'react'
import { CredentialType } from '@prisma/client'
import { useAccount } from 'wagmi'
import { BouncingDotsLoader } from '@dae/ui'
import withCourse from './withCourse'

const withCourseRoleAuth = (
  WrappedComponent: FC,
  allowedRole: CredentialType,
) => {
  const ProtectedPage: FC = (props) => {
    const router = useRouter()
    const courseAddress = router.query.address as Address
    const { address: userAddress } = useAccount()

    const { data: courseData, isLoading: isLoadingCourseData } = useCourse({
      courseAddress,
    })

    const {
      data: isAdmin,
      isLoading: isLoadingAdminRole,
      isError: isErrorLoadingAdminRole,
    } = useIsAdmin({ courseAddress })
    const {
      data: isMagister,
      isLoading: isLoadingMagisterRole,
      isError: isErrorLoadingMagisterRole,
    } = useIsMagister({ courseAddress })
    const {
      data: hasAccess,
      isLoading: isLoadingHasAccess,
      isError: isErrorLoadingHasAccess,
    } = useHasAccess({
      courseAddress: courseAddress,
      userAddress: userAddress,
    })

    if (
      (!isLoadingCourseData && !courseData) ||
      isErrorLoadingAdminRole ||
      isErrorLoadingMagisterRole ||
      isErrorLoadingHasAccess
    ) {
      router.push('/404')
      return null
    }

    if (
      isLoadingCourseData ||
      isLoadingAdminRole ||
      isLoadingMagisterRole ||
      isLoadingHasAccess
    ) {
      return <BouncingDotsLoader />
    }

    if (
      !(isAdmin && allowedRole === 'ADMIN') &&
      !((isAdmin || isMagister) && allowedRole === 'MAGISTER') &&
      !((isAdmin || isMagister || hasAccess) && allowedRole === 'DISCIPULUS')
    ) {
      router.push('/')
      return null
    }

    return <WrappedComponent {...props} />
  }

  return withCourse(ProtectedPage)
}

export default withCourseRoleAuth
