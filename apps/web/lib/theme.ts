import { alertAnatomy } from '@chakra-ui/anatomy'
import { createMultiStyleConfigHelpers } from '@chakra-ui/react'
import { extendTheme } from '@chakra-ui/react'

const { definePartsStyle, defineMultiStyleConfig } =
  createMultiStyleConfigHelpers(alertAnatomy.keys)

const customAlertTheme = defineMultiStyleConfig({
  baseStyle: definePartsStyle({
    container: {
      borderRadius: 'lg', // Set the desired border radius value
    },
  }),
})

const theme = extendTheme({
  components: {
    Alert: customAlertTheme, // Add the custom alert style configuration
  },
})

export default theme
