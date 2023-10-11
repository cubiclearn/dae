import { useRouter } from 'next/router'
import { Address } from 'viem'
import { useHasAccess, useIsAdmin, useIsMagister } from '@dae/wagmi'
import { FC } from 'react'
import { CredentialType } from '@prisma/client'
import { useAccount } from 'wagmi'

const withCourseRoleAuth = (
  WrappedComponent: FC,
  allowedRole: CredentialType,
) => {
  const ProtectedPage: FC = (props) => {
    const router = useRouter()
    const courseAddress = router.query.address as Address
    const { address: userAddress } = useAccount()

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
    const {
      data: hasAccess,
      isLoading: isLoadingHasAccess,
      isError: isErrorLoadingHasAccess,
    } = useHasAccess({
      courseAddress: courseAddress,
      userAddress: userAddress,
    })

    if (isLoadingAdminRole || isLoadingMagisterRole || isLoadingHasAccess) {
      return null
    }

    if (
      isErrorLoadingAdminRole ||
      isErrorLoadingMagisterRole ||
      isErrorLoadingHasAccess
    ) {
      router.push('/404')
      return null
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

  return ProtectedPage
}

export default withCourseRoleAuth
