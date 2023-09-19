import {
  Box,
  chakra,
  Container,
  Stack,
  Text,
  useColorModeValue,
  VisuallyHidden,
} from '@chakra-ui/react'
import { FaDiscord, FaGithub, FaTelegram } from 'react-icons/fa'
import { ReactNode } from 'react'

const SocialButton = ({
  children,
  label,
  href,
}: {
  children: ReactNode
  label: string
  href: string
}) => {
  return (
    <chakra.button
      bg={useColorModeValue('blackAlpha.100', 'whiteAlpha.100')}
      rounded={'full'}
      w={8}
      h={8}
      cursor={'pointer'}
      as={'a'}
      href={href}
      display={'inline-flex'}
      alignItems={'center'}
      justifyContent={'center'}
      transition={'background 0.3s ease'}
      _hover={{
        bg: useColorModeValue('blackAlpha.200', 'whiteAlpha.200'),
      }}
    >
      <VisuallyHidden>{label}</VisuallyHidden>
      {children}
    </chakra.button>
  )
}

export const Footer = () => {
  return (
    <Box color={useColorModeValue('gray.700', 'gray.200')}>
      <Container
        as={Stack}
        maxW={'6xl'}
        py={4}
        direction={{ base: 'column', md: 'row' }}
        spacing={4}
        justify={{ base: 'center', md: 'space-between' }}
        align={{ base: 'center', md: 'center' }}
      >
        <Text fontWeight={'bold'} fontSize={'md'}>
          Version:{' '}
          <Text fontWeight={'normal'} as="span">
            {process.env.NEXT_PUBLIC_COMMIT_TAG ??
              process.env.NEXT_PUBLIC_COMMIT_SHA}
          </Text>
        </Text>
        <Stack direction={'row'} spacing={6}>
          <SocialButton
            label={'Twitter'}
            href={'https://github.com/cubiclearn'}
          >
            <FaGithub />
          </SocialButton>
          <SocialButton label={'Instagram'} href={'https://t.me/cubiclearn'}>
            <FaTelegram />
          </SocialButton>
          <SocialButton
            label={'Instagram'}
            href={'https://discord.gg/3GtYdEFB'}
          >
            <FaDiscord />
          </SocialButton>
        </Stack>
      </Container>
    </Box>
  )
}
