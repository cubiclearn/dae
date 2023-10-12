import React, { useEffect, useRef, useState } from 'react'
import {
  Table,
  TableContainer,
  Tbody,
  Th,
  Thead,
  Tr,
  useToast,
  Box,
  Center,
  Spinner,
} from '@chakra-ui/react'
import { CredentialRow } from './CredentialRow'
import { useBurnCredential } from '@dae/wagmi'
import { Address, useAccount } from 'wagmi'
import { CredentialType, UserCredentials } from '@dae/database'
import { ConfirmActionModal } from '../../ConfirmActionModal'
import { useIntersectionObserver } from 'usehooks-ts'

interface CredentialRowListProps {
  courseAddress: Address
  karmaAccessControlAddress: Address
  credentialType: CredentialType
  data: UserCredentials[]
  fetchNext: (size: number | ((_size: number) => number)) => Promise<any>
  hasNext: boolean
  page: number
}

export const CredentialRowList: React.FC<CredentialRowListProps> = ({
  courseAddress,
  data,
  fetchNext,
  hasNext,
  page,
  credentialType,
}) => {
  const toast = useToast()
  const { address: userAddress } = useAccount()
  const { burnCredential, isLoading, isSigning, isValidating } =
    useBurnCredential({ courseAddress, credentialType })

  const ref = useRef<HTMLDivElement | null>(null)
  const observer = useIntersectionObserver(ref, {})

  useEffect(() => {
    if (observer?.isIntersecting && hasNext) {
      fetchNext(page + 1)
    }
  }, [observer])

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedTeacherToBurnCredential, setSelectedTeacherToBurnCredential] =
    useState<UserCredentials | null>(null)

  const handleOpenModal = (credential: UserCredentials) => {
    setSelectedTeacherToBurnCredential(credential)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setSelectedTeacherToBurnCredential(null)
    setIsModalOpen(false)
  }

  const handleBurnStudentCredential = async () => {
    if (selectedTeacherToBurnCredential !== null) {
      setIsModalOpen(false)
      toast.promise(
        burnCredential(selectedTeacherToBurnCredential.credential_token_id),
        {
          success: {
            title: 'User credential burned with success!',
          },
          error: (error) => ({
            title: 'Error burning credential.',
            description: error?.message ?? 'Something went wrong',
            isClosable: true,
            duration: null,
          }),
          loading: {
            title: 'Burning user credential in progress...',
            description:
              'Processing transaction on the blockchain can take some time (usually around one minute).',
          },
        },
      )
    } else {
      setIsModalOpen(false)
    }
  }

  return (
    <TableContainer>
      <Table variant="simple">
        <Thead>
          <Tr>
            <Th width={'5%'}>{''}</Th>
            <Th>Address</Th>
            <Th width={'5%'}>{''}</Th>
          </Tr>
        </Thead>
        <Tbody>
          {data.map((credential) => (
            <CredentialRow
              key={credential.user_address}
              user_address={credential.user_address as Address}
              isDeleting={
                (isLoading || isValidating || isSigning) &&
                selectedTeacherToBurnCredential?.credential_token_id ===
                  credential.credential_token_id
              }
              onDelete={
                credential.issuer === userAddress?.toLowerCase()
                  ? () => handleOpenModal(credential)
                  : undefined
              }
            />
          ))}
        </Tbody>
      </Table>
      {hasNext && (
        <Box p={4}>
          <Center ref={ref}>
            <Spinner />
          </Center>
        </Box>
      )}
      <ConfirmActionModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onConfirm={handleBurnStudentCredential}
        title="Confirm action"
        body="Are you sure you want to revoke this credential?"
        confirmButtonText="Revoke"
      />
    </TableContainer>
  )
}
