import React from 'react'
import {
  Center,
  Spinner,
  Alert,
  AlertIcon,
  Box,
  AlertTitle,
  AlertDescription,
  Card,
  CardBody,
  Heading,
  Stack,
  Text,
  Image,
} from '@chakra-ui/react'
import { useCourseCredential } from '@dae/wagmi'

type CredentialInfoProps = {
  credentialId: number | undefined
}

export const CredentialInfo: React.FC<CredentialInfoProps> = ({
  credentialId,
}) => {
  const { data, isLoading, error } = useCourseCredential(credentialId)

  if (isLoading || (!data && !error)) {
    return (
      <Center>
        <Spinner />
      </Center>
    )
  }

  if (error) {
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

  if (!data) {
    return (
      <Alert status="info">
        <AlertIcon />
        <Box>
          <AlertTitle>Nothing to show.</AlertTitle>
          <AlertDescription>There is no course to show</AlertDescription>
        </Box>
      </Alert>
    )
  }

  return (
    <Card
      direction={{ base: 'column', sm: 'row', lg: 'column' }}
      overflow="hidden"
      p={4}
      boxShadow={'md'}
    >
      <Image
        objectFit="cover"
        src={data.image_url}
        borderRadius="lg"
        aspectRatio={1}
        maxW={{ base: '100%', sm: '30%', lg: '100%' }}
      />

      <Stack>
        <CardBody>
          <Heading size="md">{data.name}</Heading>
          <Text py="2">{data.description}</Text>
        </CardBody>
      </Stack>
    </Card>
  )
}
