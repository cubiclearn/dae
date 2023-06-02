import {FC} from 'react'
import {BoxProps, Stack, Text, Card, CardBody, Image, Heading, Link} from '@chakra-ui/react'
import NextLink from 'next/link'
import {useCourse} from '@dae/hooks'
import {Alert, AlertIcon, AlertDescription} from '@chakra-ui/react'

interface CourseCardProps extends BoxProps {
  address: string | undefined
}

export const CourseCard: FC<CourseCardProps> = ({address, ...rest}) => {
  const {data, error} = useCourse(address)

  if (error) {
    return (
      <Alert status="error">
        <AlertIcon />
        <AlertDescription>There is an error fetching courses</AlertDescription>
      </Alert>
    )
  }

  if (!data) {
    return <></>
  }

  return (
    <Link as={NextLink} href={`/course/${address}`} style={{textDecoration: 'none'}}>
      <Card maxW="sm" {...rest}>
        <CardBody>
          <Image src={data.course.image_url} alt="" borderRadius="lg" aspectRatio={1} />
          <Stack mt="6" spacing="3">
            <Heading size="md">{data.course.name}</Heading>
            <Text>{data.course.description}</Text>
          </Stack>
        </CardBody>
      </Card>
    </Link>
  )
}
