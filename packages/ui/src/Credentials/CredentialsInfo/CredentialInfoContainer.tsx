import {
  Stack,
  Box,
  Center,
  Spinner,
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Button,
  Link,
} from '@chakra-ui/react'
import React, { useState } from 'react'
import { CredentialInfo } from './CredentialInfo'
import { CredentialUsers } from './CredentialUsers'
import {
  useCourseCredential,
  useCourseCredentialUsers,
  useDeleteCredential,
} from '@dae/wagmi'
import { ArrowBackIcon } from '@chakra-ui/icons'
import NextLink from 'next/link'
import { Address } from 'viem'
import { ConfirmActionModal } from '../../ConfirmActionModal'
import { useRouter } from 'next/router'

type CredentialInfoContainerProps = {
  credentialId: number | undefined
  courseAddress: Address | undefined
}

export const CredentialInfoContainer: React.FC<CredentialInfoContainerProps> =
  ({ credentialId, courseAddress }) => {
    const router = useRouter()
    const {
      data: credentialUsersData,
      isLoading: isLoadingCredentialUsersData,
      error: credentialUsersDataError,
    } = useCourseCredentialUsers(credentialId)
    const {
      data: credentialData,
      isLoading: isLoadingCredentialData,
      error: credentialDataError,
    } = useCourseCredential(credentialId)

    const {
      deleteCredential,
      isLoading: isDeletingCredential,
      isError: isErrorDeletingCredential,
    } = useDeleteCredential(
      credentialData?.id,
      credentialData?.course_address as Address,
      credentialData?.course_chain_id,
    )

    const [isModalOpen, setIsModalOpen] = useState(false)

    const handleOpenModal = () => {
      setIsModalOpen(true)
    }

    const handleCloseModal = () => {
      setIsModalOpen(false)
    }

    const handleConfirmDelete = async () => {
      try {
        handleCloseModal()
        await deleteCredential()
        router.push(`/course/${courseAddress}/credentials/list`)
      } catch (_e: any) {}
    }

    if (
      !credentialId ||
      !courseAddress ||
      isLoadingCredentialUsersData ||
      (!credentialUsersData && !credentialUsersDataError) ||
      isLoadingCredentialData ||
      (!credentialData && !credentialDataError)
    ) {
      return (
        <Center>
          <Spinner />
        </Center>
      )
    }

    if (credentialUsersDataError || credentialDataError) {
      return (
        <Alert status="error">
          <AlertIcon />
          <Box>
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              There is an error fetching your data. Try again later.
            </AlertDescription>
          </Box>
        </Alert>
      )
    }

    if (!credentialData || !credentialUsersData) {
      return (
        <Alert status="info">
          <AlertIcon />
          <Box>
            <AlertTitle>Nothing to show.</AlertTitle>
            <AlertDescription>There is no credential to show.</AlertDescription>
          </Box>
        </Alert>
      )
    }

    return (
      <Stack spacing={{ base: 8, lg: 4 }}>
        {isErrorDeletingCredential ? (
          <Alert status="error">
            <AlertIcon />
            <Box>
              <AlertTitle>Something went wrong</AlertTitle>
              <AlertDescription>
                There is an error deleting this credential. Try again later.
              </AlertDescription>
            </Box>
          </Alert>
        ) : (
          <></>
        )}
        <Stack justifyContent={'space-between'} direction={'row'}>
          <Box>
            <Link
              as={NextLink}
              href={`/course/${courseAddress}/credentials/list`}
            >
              <Button leftIcon={<ArrowBackIcon />}>Back</Button>
            </Link>
          </Box>
          {credentialUsersData.length === 0 ? (
            <Box>
              <Button
                colorScheme="red"
                onClick={handleOpenModal}
                isLoading={isDeletingCredential}
              >
                Delete
              </Button>
            </Box>
          ) : (
            <></>
          )}
        </Stack>
        <Stack
          direction={{ base: 'column', lg: 'row' }} // Stack vertically on base, horizontally on lg
          spacing={8}
          maxW="100%"
        >
          <Box
            flex={{ base: 'none', lg: '1 1 30%', xl: '1 1 20%' }} // 30% width on lg, auto on base
            maxW={{ base: '100%', lg: 'none' }} // Adjust max width based on screen size
          >
            <CredentialInfo credentialData={credentialData} />
          </Box>
          <Box flex={{ base: '1', lg: '2 1 70%', xl: '2 1 80%' }}>
            <CredentialUsers
              courseAddress={courseAddress}
              credentialUsersData={credentialUsersData}
            />
          </Box>
        </Stack>
        <ConfirmActionModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onConfirm={handleConfirmDelete}
          title="Confirm Deletion"
          body="Are you sure you want to delete this credential?"
          confirmButtonText="Delete"
        />
      </Stack>
    )
  }
