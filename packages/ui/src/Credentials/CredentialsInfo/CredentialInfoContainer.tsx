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
import { CredentialHolders } from './CredentialHolders'
import {
  useCourseCredential,
  useCourseCredentialHolders,
  useDeleteCredential,
} from '@dae/wagmi'
import { ArrowBackIcon } from '@chakra-ui/icons'
import NextLink from 'next/link'
import { Address } from 'viem'
import { ConfirmActionModal } from '../../ConfirmActionModal'
import { useRouter } from 'next/router'
import { useNetwork } from 'wagmi'
import { SyncButton } from '../../SyncButton'

type CredentialInfoContainerProps = {
  credentialCid: string | undefined
  courseAddress: Address | undefined
}

export const CredentialInfoContainer: React.FC<CredentialInfoContainerProps> =
  ({ credentialCid, courseAddress }) => {
    const router = useRouter()
    const { chain } = useNetwork()
    const {
      data: credentialUsersData,
      isLoading: isLoadingCredentialUsersData,
      error: credentialUsersDataError,
    } = useCourseCredentialHolders(credentialCid, courseAddress, chain?.id)
    const {
      data: credentialData,
      isLoading: isLoadingCredentialData,
      error: credentialDataError,
    } = useCourseCredential(credentialCid, courseAddress, chain?.id)

    const {
      deleteCredential,
      isLoading: isDeletingCredential,
      isError: isErrorDeletingCredential,
    } = useDeleteCredential(
      credentialData?.credential.ipfs_cid,
      credentialData?.credential.course_address as Address,
      credentialData?.credential.course_chain_id,
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
      !credentialCid ||
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
            <AlertTitle>Something went wrong.</AlertTitle>
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
              <AlertTitle>Something went wrong.</AlertTitle>
              <AlertDescription>
                There is an error deleting this credential. Try again later.
              </AlertDescription>
            </Box>
          </Alert>
        ) : (
          <></>
        )}
        <Stack justifyContent={'space-between'} direction={'row'}>
          <Stack
            justifyContent={'space-between'}
            direction={'row'}
            width={'full'}
          >
            <Link
              as={NextLink}
              href={`/course/${courseAddress}/credentials/list`}
            >
              <Button leftIcon={<ArrowBackIcon />}>Back</Button>
            </Link>
            <SyncButton />
          </Stack>
          {credentialUsersData.userCredentials.length === 0 ? (
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
        <Stack direction={{ base: 'column', lg: 'row' }} spacing={8}>
          <Box width={{ base: 'none', lg: '30%', xl: '20%' }}>
            <CredentialInfo credentialData={credentialData.credential} />
          </Box>
          <Box width={{ base: 'none', lg: '70%', xl: '80%' }}>
            <CredentialHolders
              courseAddress={courseAddress}
              credentialUsersData={credentialUsersData.userCredentials}
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
