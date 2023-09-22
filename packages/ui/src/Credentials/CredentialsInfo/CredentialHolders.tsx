import React, { useState } from 'react'
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

interface CredentialHoldersProps {
  courseAddress: Address
  credentialUsersData: UserCredentials[]
}

export const CredentialHolders: React.FC<CredentialHoldersProps> = ({
  courseAddress,
  credentialUsersData,
}) => {
  const toast = useToast()
  const {
    burnCredential,
    isLoading: isBurningCredential,
    isError: isErrorBurningCredential,
    isSigning: isSigningBurningCredentialTransaction,
    isValidating: isValidatingBurningCredential,
  } = useBurnCredential(courseAddress, 'OTHER')

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

  const handleBurnCredential = async () => {
    try {
      if (selectedCredential !== null) {
        setIsModalOpen(false)
        toast.promise(burnCredential(selectedCredential.credential_token_id), {
          success: {
            title: 'User credential burned with success!',
          },
          error: { title: 'Error burning user credential.' },
          loading: {
            title: 'Burning user credential in progress...',
            description:
              'Processing transaction on the blockchain can take some time (usually around one minute).',
          },
        })
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
            <AlertTitle>Something went wrong.</AlertTitle>
            <AlertDescription>
              There is an error burning this credential. Try again later.
            </AlertDescription>
          </Box>
        </Alert>
      ) : (
        <></>
      )}
      <Stack spacing={2}>
        <Text fontWeight={'semibold'} fontSize={'2xl'}>
          Credential Holders
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
                              isValidatingBurningCredential ||
                              isSigningBurningCredentialTransaction) &&
                            selectedCredential?.credential_token_id ===
                              userCredential.credential_token_id
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
                There is no user who holds this credential.
              </AlertDescription>
            </Box>
          </Alert>
        )}
      </Stack>
      <ConfirmActionModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onConfirm={handleBurnCredential}
        title="Confirm operation"
        body="Are you sure you want to revoke this credential?"
        confirmButtonText="Revoke"
      />
    </Stack>
  )
}
