import { FC } from 'react'
import { Stack, Text, Card, CardBody, Image, Heading } from '@chakra-ui/react'
import { Alert, AlertIcon, AlertDescription } from '@chakra-ui/react'
import { Credential } from '@dae/database'

type CredentialsCardProps = {
  data: Credential
}

export const CredentialsCard: FC<CredentialsCardProps> = ({ data }) => {
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
    <Card maxW="sm" boxShadow={'md'}>
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
        </Stack>
      </CardBody>
    </Card>
  )
}
