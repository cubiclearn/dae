import { FC, useState } from 'react'
import {
  Stack,
  Text,
  Card,
  CardBody,
  Image,
  Heading,
  Button,
} from '@chakra-ui/react'
import { Alert, AlertIcon, AlertDescription } from '@chakra-ui/react'
import { useDeleteCredential } from '@dae/wagmi'
import { Credential } from '@dae/database'
import { Address } from 'viem'
import { ConfirmActionModal } from '../ConfirmActionModal'

type CredentialsCardProps = {
  data: Credential
}

export const CredentialsCard: FC<CredentialsCardProps> = ({ data }) => {
  const { deleteCredential, isLoading } = useDeleteCredential(
    data.id,
    data.course_address as Address,
    data.course_chain_id,
  )

  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleOpenModal = () => {
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
  }

  const handleConfirmDelete = async () => {
    handleCloseModal()
    await deleteCredential()
  }

  if (!data) {
    return (
      <Alert status="error">
        <AlertIcon />
        <AlertDescription>
          There is an error fetching credentials
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <Card maxW="sm">
      <CardBody>
        <Image
          src={data.image_url}
          alt=""
          borderRadius="lg"
          aspectRatio={1}
          w={'100%'}
        />
        <Stack mt="6" spacing="3">
          <Heading size="md">{data.name}</Heading>
          <Text>{data.description}</Text>
          {data.type === 'OTHER' ? (
            <>
              <Button
                colorScheme="red"
                isLoading={isLoading}
                onClick={handleOpenModal}
              >
                Delete
              </Button>
              <ConfirmActionModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onConfirmAction={handleConfirmDelete}
                title="Confirm Deletion"
                body="Are you sure you want to delete this credential?"
                confirmButtonText="Delete"
                cancelButtonText="Cancel"
              />
            </>
          ) : (
            <></>
          )}
        </Stack>
      </CardBody>
    </Card>
  )
}
