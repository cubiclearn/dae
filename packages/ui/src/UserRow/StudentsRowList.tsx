import React, { useEffect, useState } from 'react'
import {
  Table,
  TableContainer,
  Tbody,
  Th,
  Thead,
  Tr,
  useToast,
} from '@chakra-ui/react'
import { UserRow } from './UserRow'
import {
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Box,
  Center,
  Spinner,
  Text,
} from '@chakra-ui/react'
import { useBurnCredential, useCourseStudents } from '@dae/wagmi'
import { Address, useNetwork } from 'wagmi'
import { UserCredentials } from '@dae/database'
import { ConfirmActionModal } from '../ConfirmActionModal'

interface StudentsRowListProps {
  courseAddress: Address
}

export const StudentsRowList: React.FC<StudentsRowListProps> = ({
  courseAddress,
}) => {
  const { chain } = useNetwork()

  const {
    data: response,
    error,
    isLoading,
  } = useCourseStudents(courseAddress, chain?.id)

  const toast = useToast()
  const {
    burnCredential,
    isLoading: isBurningCredential,
    isError: isErrorBurningCredential,
    isSuccess: isSuccessBurningCredential,
    isSigning: isSigningBurningCredentialTransaction,
    isValidating: isValidatingBurningCredential,
  } = useBurnCredential(courseAddress, 'MAGISTER')

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedStudentToBurnCredential, setSelectedStudentToBurnCredential] =
    useState<UserCredentials | null>(null)

  const handleOpenModal = (credential: UserCredentials) => {
    setSelectedStudentToBurnCredential(credential)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setSelectedStudentToBurnCredential(null)
    setIsModalOpen(false)
  }

  useEffect(() => {
    if (isErrorBurningCredential) {
      toast({
        title: 'Error burning credential.',
        status: 'error',
      })
    }
    if (isSuccessBurningCredential) {
      toast({
        title: 'Credential burned with success!',
        status: 'success',
      })
    }
    if (isBurningCredential) {
      toast({
        title: 'Burning selected credential...',
        status: 'info',
      })
    }
  }, [
    isBurningCredential,
    isErrorBurningCredential,
    isSuccessBurningCredential,
  ])

  const handleBurnStudentCredential = async () => {
    try {
      if (selectedStudentToBurnCredential !== null) {
        setIsModalOpen(false)
        await burnCredential(
          selectedStudentToBurnCredential.credential_token_id,
        )
        setSelectedStudentToBurnCredential(null)
      }
    } catch (_e: any) {
      setSelectedStudentToBurnCredential(null)
      setIsModalOpen(false)
    }
  }

  if (isLoading) {
    return (
      <Center>
        <Spinner />
      </Center>
    )
  }

  if (error) {
    return (
      <Alert status="error">
        <AlertIcon />
        <Box>
          <AlertTitle>Something went wrong.</AlertTitle>
          <AlertDescription>
            There is an error fetching your data. Try again later.
          </AlertDescription>
        </Box>
      </Alert>
    )
  }

  if (!response || response.data.students.length === 0) {
    return (
      <Alert status="info">
        <AlertIcon />
        <Box>
          <AlertTitle>Nothing to show.</AlertTitle>
          <AlertDescription>
            There are no students enrolled in this course
          </AlertDescription>
        </Box>
      </Alert>
    )
  }

  return (
    <Box padding={8} borderRadius="xl" bg={'white'} boxShadow={'base'}>
      {isErrorBurningCredential ? (
        <Alert status="error">
          <AlertIcon />
          <Box>
            <AlertTitle>Something went wrong.</AlertTitle>
            <AlertDescription>
              There is an error removing this student. Try again later.
            </AlertDescription>
          </Box>
        </Alert>
      ) : (
        <></>
      )}
      <Box pb={2}>
        <Text fontWeight="semibold" fontSize="xl">
          Students list
        </Text>
      </Box>
      <TableContainer>
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th width={'5%'}>{''}</Th>
              <Th>Address</Th>
              <Th>E-mail</Th>
              <Th>Discord</Th>
              <Th width={'5%'} isNumeric>
                Karma
              </Th>
              <Th width={'5%'}>{''}</Th>
            </Tr>
          </Thead>
          <Tbody>
            {response.data.students.map((student) => (
              <UserRow
                key={student.user_address}
                user={student}
                isDeleting={
                  (isBurningCredential ||
                    isValidatingBurningCredential ||
                    isSigningBurningCredentialTransaction) &&
                  selectedStudentToBurnCredential?.credential_token_id ===
                    student.credential_token_id
                }
                onDelete={() => handleOpenModal(student)}
              />
            ))}
          </Tbody>
        </Table>
      </TableContainer>
      <ConfirmActionModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onConfirm={handleBurnStudentCredential}
        title="Confirm Deletion"
        body="Are you sure you want to remove this student?"
        confirmButtonText="Delete"
      />
    </Box>
  )
}
