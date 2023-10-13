import { Box, Stack, Text } from '@chakra-ui/react'
import './BouncingDotsLoader.css'

export const BouncingDotsLoader = () => {
  return (
    <Stack
      spacing={6}
      position="fixed"
      top="50%"
      left="50%"
      transform="translate(-50%, -50%)"
      zIndex="999" // Optional, to ensure it's on top of other content
    >
      <Box className="bouncing-loader">
        <Box />
        <Box />
        <Box />
      </Box>
      <Text>Loading course...</Text>
    </Stack>
  )
}
