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
import { useBurnCredential, useCourseTeachers } from '@dae/wagmi'
import { Address, useNetwork } from 'wagmi'
import { UserCredentials } from '@dae/database'
import { ConfirmActionModal } from '../ConfirmActionModal'

interface TeachersRowListProps {
  courseAddress: Address
}

export const TeachersRowList: React.FC<TeachersRowListProps> = ({
  courseAddress,
}) => {
  const { chain } = useNetwork()

  const {
    data: response,
    error,
    isLoading,
  } = useCourseTeachers(courseAddress, chain?.id)

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
      if (selectedTeacherToBurnCredential !== null) {
        setIsModalOpen(false)
        await burnCredential(
          selectedTeacherToBurnCredential.credential_token_id,
        )
        setSelectedTeacherToBurnCredential(null)
      }
    } catch (_e: any) {
      setSelectedTeacherToBurnCredential(null)
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

  if (!response || response.data.teachers.length === 0) {
    return (
      <Alert status="info">
        <AlertIcon />
        <Box>
          <AlertTitle>Nothing to show.</AlertTitle>
          <AlertDescription>
            There are no teachers enrolled in this course
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
              There is an error removing this teacher. Try again later.
            </AlertDescription>
          </Box>
        </Alert>
      ) : (
        <></>
      )}
      <Box pb={2}>
        <Text fontWeight="semibold" fontSize="xl">
          Teachers list
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
            {response.data.teachers.map((teacherCredential) => (
              <UserRow
                key={teacherCredential.user_address}
                user={teacherCredential}
                isDeleting={
                  (isBurningCredential ||
                    isValidatingBurningCredential ||
                    isSigningBurningCredentialTransaction) &&
                  selectedTeacherToBurnCredential?.credential_token_id ===
                    teacherCredential.credential_token_id
                }
                onDelete={() => handleOpenModal(teacherCredential)}
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
        body="Are you sure you want to remove this teacher?"
        confirmButtonText="Delete"
      />
    </Box>
  )
}
