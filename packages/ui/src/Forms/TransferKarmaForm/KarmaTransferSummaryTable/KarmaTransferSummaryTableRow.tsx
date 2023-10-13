import { Tr, Td, Spinner } from '@chakra-ui/react'
import { useKarmaBalance, useHasAccess } from '@dae/wagmi'
import { Address, isAddress } from 'viem'
import { useCourseData } from '../../../CourseProvider'

type KarmaTransferSummaryTableProps = {
  userAddress: Address
  userKarmaIncrement: number
}

export const KarmaTransferSummaryTableRow: React.FC<
  KarmaTransferSummaryTableProps
> = ({ userAddress, userKarmaIncrement }) => {
  const { data: courseData } = useCourseData()
  const { data: userKarmaBalance } = useKarmaBalance({
    karmaAccessControlAddress:
      courseData?.karma_access_control_address as Address,
    userAddress: isAddress(userAddress) ? userAddress : undefined,
  })

  const { data: userHasAccess } = useHasAccess({
    courseAddress: courseData?.address as Address,
    userAddress: isAddress(userAddress) ? userAddress : undefined,
  })

  if (!userHasAccess) {
    return (
      <Tr>
        <Td>{userAddress}</Td>
        <Td>--</Td>
        <Td>--</Td>
        <Td>--</Td>
      </Tr>
    )
  }

  return (
    <Tr>
      <Td>{userAddress}</Td>
      <Td>{!userKarmaBalance ? <Spinner /> : userKarmaBalance}</Td>
      <Td color={userKarmaIncrement > 0 ? 'green.500' : 'red.500'}>
        {userKarmaIncrement > 0
          ? `+${userKarmaIncrement}`
          : `${userKarmaIncrement}`}
      </Td>
      <Td>
        {!userKarmaBalance ? (
          <Spinner />
        ) : (
          userKarmaBalance + userKarmaIncrement
        )}
      </Td>
    </Tr>
  )
}
