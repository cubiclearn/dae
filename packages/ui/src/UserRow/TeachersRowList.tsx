import React, { useEffect, useRef, useState } from 'react'
import {
  Stack,
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
import { useIntersectionObserver } from 'usehooks-ts'

interface TeachersRowListProps {
  courseAddress: Address
}

export const TeachersRowList: React.FC<TeachersRowListProps> = ({
  courseAddress,
}) => {
  const { chain } = useNetwork()

  const { data, error, isLoading, setSize, size, hasMore } = useCourseTeachers(
    courseAddress,
    chain?.id,
  )

  const toast = useToast()
  const {
    burnCredential,
    isLoading: isBurningCredential,
    isError: isErrorBurningCredential,
    isSigning: isSigningBurningCredentialTransaction,
    isValidating: isValidatingBurningCredential,
  } = useBurnCredential(courseAddress, 'MAGISTER')

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedTeacherToBurnCredential, setSelectedTeacherToBurnCredential] =
    useState<UserCredentials | null>(null)

  const ref = useRef<HTMLDivElement | null>(null)
  const observer = useIntersectionObserver(ref, {})

  useEffect(() => {
    if (observer?.isIntersecting && hasMore) {
      setSize(size + 1)
    }
  }, [observer])

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
        burnCredential(selectedTeacherToBurnCredential.credential_token_id)
          .then(() => {
            setSelectedTeacherToBurnCredential(null)
          })
          .catch(() => {
            setSelectedTeacherToBurnCredential(null)
          }),
        {
          success: {
            title: 'User credential burned with success!',
          },
          error: { title: 'Error burning user credential.' },
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

  if (!data || data.teachers.length === 0) {
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
    <Stack padding={8} borderRadius="xl" bg={'white'} boxShadow={'base'}>
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
      <Stack spacing={4}>
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
              {data.teachers.map((teacherCredential) => (
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
          {hasMore && (
            <Box p={4}>
              <Center ref={ref}>
                <Spinner />
              </Center>
            </Box>
          )}
        </TableContainer>
        <ConfirmActionModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onConfirm={handleBurnStudentCredential}
          title="Confirm Deletion"
          body="Are you sure you want to remove this teacher?"
          confirmButtonText="Delete"
        />
      </Stack>
    </Stack>
  )
}
