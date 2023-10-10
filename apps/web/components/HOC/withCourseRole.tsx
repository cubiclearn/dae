import { useRouter } from 'next/router'
import { Address } from 'viem'
import { useIsAdmin, useIsMagister } from '@dae/wagmi'
import { FC } from 'react'
import { CredentialType } from '@prisma/client'

const withCourseRoleAuth = (
  WrappedComponent: FC,
  allowedRole: CredentialType,
) => {
  const ProtectedPage: FC = (props) => {
    const router = useRouter()
    const courseAddress = router.query.address as Address

    const {
      data: isAdmin,
      isLoading: isLoadingAdminRole,
      isError: isErrorLoadingAdminRole,
    } = useIsAdmin(courseAddress)
    const {
      data: isMagister,
      isLoading: isLoadingMagisterRole,
      isError: isErrorLoadingMagisterRole,
    } = useIsMagister(courseAddress)

    if (isLoadingAdminRole || isLoadingMagisterRole) {
      return null
    }

    if (isErrorLoadingAdminRole || isErrorLoadingMagisterRole) {
      router.push('/404')
      return null
    }

    if (
      !(isAdmin && allowedRole === 'ADMIN') &&
      !(isMagister && allowedRole === 'MAGISTER')
    ) {
      router.push('/')
      return null
    }

    return <WrappedComponent {...props} />
  }

  return ProtectedPage
}

export default withCourseRoleAuth
