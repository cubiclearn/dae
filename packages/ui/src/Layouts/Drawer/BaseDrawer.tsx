import React from 'react'
import {
  Drawer,
  DrawerCloseButton,
  DrawerContent,
  Stack,
  Box,
} from '@chakra-ui/react'
import { Logo } from '../Logo'

type DrawerProps = {
  children: React.ReactNode
  isOpen: boolean
  onClose: () => void
}
export const BaseDrawer: React.FC<DrawerProps> = ({
  children,
  isOpen,
  onClose,
}) => {
  return (
    <Drawer
      autoFocus={false}
      isOpen={isOpen}
      placement="left"
      onClose={onClose}
      returnFocusOnClose={false}
      onOverlayClick={onClose}
      size="xs"
    >
      <DrawerContent pt={8} px={8}>
        <DrawerCloseButton />
        <Stack spacing={6}>
          <Box mx="2">
            <Logo />
          </Box>
          {children}
        </Stack>
      </DrawerContent>
    </Drawer>
  )
}
