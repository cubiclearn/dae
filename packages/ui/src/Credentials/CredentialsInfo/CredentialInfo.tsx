import React from 'react'
import { Card, CardBody, Heading, Stack, Text, Image } from '@chakra-ui/react'
import { Credential } from '@dae/database'

type CredentialInfoProps = {
  credentialData: Credential
}

export const CredentialInfo: React.FC<CredentialInfoProps> = ({
  credentialData,
}) => {
  return (
    <Card overflow="hidden" p={4} boxShadow={'md'}>
      <Stack
        spacing={{ base: 4, sm: 6, lg: 4 }}
        direction={{ base: 'column', sm: 'row', lg: 'column' }}
      >
        <Image
          objectFit="cover"
          src={credentialData.image_url}
          borderRadius="lg"
          aspectRatio={1}
          maxW={{ base: '100%', sm: '30%', lg: '100%' }}
          minW={'30%'}
        />

        <Stack>
          <CardBody p={0}>
            <Heading size="md">{credentialData.name}</Heading>
            <Text py="2">{credentialData.description}</Text>
          </CardBody>
        </Stack>
      </Stack>
    </Card>
  )
}
