import React, { useState } from 'react'
import { Button, Stack, useToast } from '@chakra-ui/react'
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
import {
  useCourse,
  useCourseCredentialOwners,
  useDeleteCredential,
} from '@dae/wagmi'
import { Address, useNetwork } from 'wagmi'
import { CredentialRowList } from './CredentialsRowList'
import { ConfirmActionModal } from '../ConfirmActionModal'
import { useRouter } from 'next/router'

interface CustomCredentialsRowListProps {
  courseAddress: Address
  credentialCid: string | undefined
}

export const CustomCredentialsRowList: React.FC<CustomCredentialsRowListProps> =
  ({ courseAddress, credentialCid }) => {
    const { chain } = useNetwork()
    const [isModalOpen, setIsModalOpen] = useState(false)
    const toast = useToast()
    const router = useRouter()

    const {
      data: courseData,
      isLoading: isLoadingCourseData,
      isError: isErrorLoadingCourseData,
    } = useCourse(courseAddress, chain?.id)

    const {
      data: credentialOwnersData,
      isError: isErrorLoadingCredentialOwnersData,
      isLoading: isLoadingCredentialOwnersData,
      setSize,
      size,
      hasMore,
    } = useCourseCredentialOwners(credentialCid, courseAddress, chain?.id)

    const { deleteCredential, isLoading: isDeletingCredential } =
      useDeleteCredential(credentialCid, courseAddress, chain?.id)

    const handleOpenModal = () => {
      setIsModalOpen(true)
    }

    const handleCloseModal = () => {
      setIsModalOpen(false)
    }

    const handleCredentialDeletionComplete = () => {
      router.replace(`/course/${courseAddress}/credentials/list`)
    }

    const handleConfirmDelete = async () => {
      handleCloseModal()
      toast.promise(
        deleteCredential().then(() => handleCredentialDeletionComplete()),
        {
          success: {
            title: 'Credential deleted with success!',
          },
          error: (error) => ({
            title: 'Error deleting credential.',
            description: error?.message ?? 'Something went wrong',
            isClosable: true,
            duration: null,
          }),
          loading: {
            title: 'Deleting credential in progress...',
          },
        },
      )
    }

    if (isLoadingCourseData || isLoadingCredentialOwnersData) {
      return (
        <Stack padding={8} borderRadius="xl" bg={'white'} boxShadow={'md'}>
          <Stack pb={2}>
            <Text fontWeight="semibold" fontSize="xl">
              Owners list
            </Text>
          </Stack>
          <Center>
            <Spinner />
          </Center>
        </Stack>
      )
    }

    if (isErrorLoadingCourseData || isErrorLoadingCredentialOwnersData) {
      return (
        <Stack padding={8} borderRadius="xl" bg={'white'} boxShadow={'md'}>
          <Stack pb={2}>
            <Text fontWeight="semibold" fontSize="xl">
              Owners list
            </Text>
          </Stack>
          <Alert status="error">
            <AlertIcon />
            <Box>
              <AlertTitle>Something went wrong.</AlertTitle>
              <AlertDescription>
                There is an error fetching your data. Try again later.
              </AlertDescription>
            </Box>
          </Alert>
        </Stack>
      )
    }

    if (
      !courseData ||
      !credentialOwnersData?.userCredentials ||
      credentialOwnersData?.userCredentials.length === 0
    ) {
      return (
        <Stack padding={8} borderRadius="xl" bg={'white'} boxShadow={'md'}>
          <Stack pb={2} direction={'row'} justifyContent={'space-between'}>
            <Text fontWeight="semibold" fontSize="xl">
              Owners list
            </Text>
            <Box>
              <Button
                colorScheme="red"
                onClick={handleOpenModal}
                isLoading={isDeletingCredential}
              >
                Delete
              </Button>
            </Box>
          </Stack>
          <Alert status="info">
            <AlertIcon />
            <Box>
              <AlertTitle>Nothing to show.</AlertTitle>
              <AlertDescription>
                This credential is not held by anyone.
              </AlertDescription>
            </Box>
          </Alert>
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

    return (
      <Stack padding={8} borderRadius="xl" bg={'white'} boxShadow={'md'}>
        <Stack pb={2}>
          <Text fontWeight="semibold" fontSize="xl">
            Owners list
          </Text>
        </Stack>
        <CredentialRowList
          karmaAccessControlAddress={
            courseData.course.karma_access_control_address as Address
          }
          courseAddress={courseAddress}
          credentialType="OTHER"
          data={credentialOwnersData.userCredentials}
          fetchNext={setSize}
          hasNext={hasMore}
          page={size}
        />
      </Stack>
    )
  }
