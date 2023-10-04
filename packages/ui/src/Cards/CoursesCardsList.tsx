import React, { useEffect, useRef } from 'react'
import {
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Box,
  Center,
  Link,
  SimpleGrid,
  Stack,
  Spinner,
} from '@chakra-ui/react'
import NextLink from 'next/link'
import { useUserCourses } from '@dae/wagmi'
import { Address, useAccount, useNetwork } from 'wagmi'
import { CredentialType } from '@dae/database'
import { Card } from './Card'
import { useIntersectionObserver } from 'usehooks-ts'

interface CoursesCardListsProps {
  roles: CredentialType[]
}

export const CoursesCardsList: React.FC<CoursesCardListsProps> = ({
  roles,
}) => {
  const { chain } = useNetwork()
  const { address } = useAccount()

  const { data, error, isLoading, setSize, size, hasMore } = useUserCourses(
    address as Address | undefined,
    chain?.id,
    roles,
  )

  const ref = useRef<HTMLDivElement | null>(null)
  const observer = useIntersectionObserver(ref, {})

  useEffect(() => {
    if (observer?.isIntersecting && hasMore) {
      setSize(size + 1)
    }
  }, [observer])

  if (isLoading) {
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
          <AlertTitle>Something went wrong.</AlertTitle>
          <AlertDescription>
            There is an error fetching your data. Try again later.
          </AlertDescription>
        </Box>
      </Alert>
    )
  }

  if (!data || data.credentials.length === 0) {
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
    <Stack height={'100%'} spacing={4}>
      <SimpleGrid
        columns={{ base: 1, sm: 2, lg: 3, xl: 5 }}
        spacing={{ base: 8 }}
      >
        {data.credentials.map((credential) => (
          <Link
            key={credential.course_address}
            as={NextLink}
            href={`/course/${credential.course_address}/info`}
            style={{ textDecoration: 'none' }}
          >
            <Card
              title={credential.course.name}
              description={credential.course.description}
              image_url={credential.course.image_url}
            />
          </Link>
        ))}
      </SimpleGrid>
      {hasMore && (
        <Center ref={ref}>
          <Spinner />
        </Center>
      )}
    </Stack>
  )
}
