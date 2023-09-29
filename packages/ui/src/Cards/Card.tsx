import {
  Card as ChackraCard,
  CardBody,
  Heading,
  Stack,
  Image,
  Text,
} from '@chakra-ui/react'
import React from 'react'

type CardProps = {
  title: string
  description: string
  image_url: string
}

export const Card: React.FC<CardProps> = ({
  title,
  description,
  image_url,
}) => {
  return (
    <ChackraCard maxW="sm" h={'100%'}>
      <CardBody>
        <Image
          width={'100%'}
          src={image_url}
          alt=""
          borderRadius="lg"
          aspectRatio={1}
        />
        <Stack mt="6" spacing="3">
          <Heading size="md">{title}</Heading>
          <Text>{description}</Text>
        </Stack>
      </CardBody>
    </ChackraCard>
  )
}
