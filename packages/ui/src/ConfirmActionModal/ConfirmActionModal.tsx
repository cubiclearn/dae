import { FC } from 'react'
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
} from '@chakra-ui/react'

type DeleteModalProps = {
  isOpen: boolean
  onClose: () => void
  onConfirmAction: () => void
  title: string
  body: string
  cancelButtonText: string
  confirmButtonText: string
}

export const ConfirmActionModal: FC<DeleteModalProps> = ({
  isOpen,
  onClose,
  onConfirmAction,
  title,
  body,
  cancelButtonText,
  confirmButtonText,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{title}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>{body}</ModalBody>
        <ModalFooter>
          <Button colorScheme="gray" onClick={onClose}>
            {cancelButtonText}
          </Button>
          <Button colorScheme="red" onClick={onConfirmAction} ml={3}>
            {confirmButtonText}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
