import React, { useEffect, useState } from 'react'
import {
  Stack,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  Text,
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Box,
  Button,
  useToast,
} from '@chakra-ui/react'
import { UserCredentials } from '@dae/database'
import { useBurnCredential } from '@dae/wagmi'
import { Address } from 'viem'
import { ConfirmActionModal } from '../../ConfirmActionModal'

interface CredentialUsersProps {
  courseAddress: Address
  credentialUsersData: UserCredentials[]
}

export const CredentialUsers: React.FC<CredentialUsersProps> = ({
  courseAddress,
  credentialUsersData,
}) => {
  const toast = useToast()
  const {
    burnCredential,
    isLoading: isBurningCredential,
    isError: isErrorBurningCredential,
    isSuccess: isSuccessBurningCredential,
    isSigning: isSigningBurningCredentialTransaction,
  } = useBurnCredential(courseAddress)

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedCredential, setselectedCredential] =
    useState<UserCredentials | null>(null)

  const handleOpenModal = (credential: UserCredentials) => {
    setselectedCredential(credential)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setselectedCredential(null)
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

  const handleBurnCredential = async () => {
    try {
      if (selectedCredential !== null) {
        setIsModalOpen(false)
        await burnCredential(
          selectedCredential.token_id,
          selectedCredential.credential_id,
        )
        setselectedCredential(null)
      }
    } catch (_e: any) {
      setselectedCredential(null)
      setIsModalOpen(false)
    }
  }

  return (
    <Stack
      spacing={4}
      borderRadius={'lg'}
      p={6}
      background={'white'}
      boxShadow={'md'}
    >
      {isErrorBurningCredential ? (
        <Alert status="error">
          <AlertIcon />
          <Box>
            <AlertTitle>Something went wrong</AlertTitle>
            <AlertDescription>
              There is an error burning this credential. Try again later.
            </AlertDescription>
          </Box>
        </Alert>
      ) : (
        <></>
      )}
      <Text fontWeight={'semibold'} fontSize={'2xl'}>
        Credential holders
      </Text>
      {credentialUsersData.length > 0 ? (
        <TableContainer>
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th width={'5%'}>{}</Th>
                <Th>Address</Th>
                <Th width={'5%'}>{}</Th>
              </Tr>
            </Thead>
            <Tbody>
              {credentialUsersData.map((userCredential, index) => {
                return (
                  <Tr key={index}>
                    <Td>{index + 1}</Td>
                    <Td>{userCredential.user_address}</Td>
                    <Td>
                      <Button
                        colorScheme="red"
                        onClick={() => handleOpenModal(userCredential)}
                        isLoading={
                          (isBurningCredential ||
                            isSigningBurningCredentialTransaction) &&
                          selectedCredential?.token_id ===
                            userCredential.token_id
                        }
                      >
                        X
                      </Button>
                    </Td>
                  </Tr>
                )
              })}
            </Tbody>
          </Table>
        </TableContainer>
      ) : (
        <Alert status="info">
          <AlertIcon />
          <Box>
            <AlertTitle>Nothing to show.</AlertTitle>
            <AlertDescription>
              There is no user who owns this credential.
            </AlertDescription>
          </Box>
        </Alert>
      )}
      <ConfirmActionModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onConfirm={handleBurnCredential}
        title="Confirm Deletion"
        body="Are you sure you want to delete this credential?"
        confirmButtonText="Delete"
      />
    </Stack>
  )
}
