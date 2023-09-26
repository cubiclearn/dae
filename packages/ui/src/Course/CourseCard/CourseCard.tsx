import { FC } from 'react'
import {
  BoxProps,
  Stack,
  Text,
  Card,
  CardBody,
  Image,
  Heading,
  Link,
} from '@chakra-ui/react'
import NextLink from 'next/link'
import { Alert, AlertIcon, AlertDescription } from '@chakra-ui/react'

interface CourseCardProps extends BoxProps {
  data: any
}

export const CourseCard: FC<CourseCardProps> = ({ data: course, ...rest }) => {
  if (!course) {
    return (
      <Alert status="error">
        <AlertIcon />
        <AlertDescription>There is an error fetching courses</AlertDescription>
      </Alert>
    )
  }

  return (
    <Link
      as={NextLink}
      href={`/course/${course.address}/info`}
      style={{ textDecoration: 'none' }}
    >
      <Card maxW="sm" {...rest} h={'100%'}>
        <CardBody>
          <Image
            src={course.image_url}
            alt=""
            borderRadius="lg"
            aspectRatio={1}
          />
          <Stack mt="6" spacing="3">
            <Heading size="md">{course.name}</Heading>
            <Text>{course.description}</Text>
          </Stack>
        </CardBody>
      </Card>
    </Link>
  )
}
