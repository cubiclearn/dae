import React from 'react'
import { Stack } from '@chakra-ui/react'
import {
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Box,
  Center,
  Spinner,
  Text,
} from '@chakra-ui/react'
import { useCourse, useCourseStudents } from '@dae/wagmi'
import { Address, useNetwork } from 'wagmi'
import { BaseCredentialRowList } from './BaseCredentialRowList'

interface StudentsCredentialsRowListProps {
  courseAddress: Address
}

export const StudentsCredentialsRowList: React.FC<
  StudentsCredentialsRowListProps
> = ({ courseAddress }) => {
  const { chain } = useNetwork()
  const {
    data: courseData,
    isLoading: isLoadingCourseData,
    isError: isErrorLoadingCourseData,
  } = useCourse(courseAddress, chain?.id)

  const {
    data: studentsCredentialsData,
    isError: isErrorLoadingStudentsCredentialsData,
    isLoading: isLoadingStudentsCredentialsData,
    setSize,
    size,
    hasMore,
  } = useCourseStudents({ courseAddress: courseAddress, chainId: chain?.id })

  if (isLoadingCourseData || isLoadingStudentsCredentialsData) {
    return (
      <Stack padding={8} borderRadius="xl" bg={'white'} boxShadow={'base'}>
        <Stack pb={2}>
          <Text fontWeight="semibold" fontSize="xl">
            Students list
          </Text>
        </Stack>
        <Center>
          <Spinner />
        </Center>
      </Stack>
    )
  }

  if (isErrorLoadingCourseData || isErrorLoadingStudentsCredentialsData) {
    return (
      <Stack padding={8} borderRadius="xl" bg={'white'} boxShadow={'base'}>
        <Stack pb={2}>
          <Text fontWeight="semibold" fontSize="xl">
            Students list
          </Text>
        </Stack>
        <Alert status="error">
          <AlertIcon />
          <Box>
            <AlertTitle>Something went wrong.</AlertTitle>
            <AlertDescription>
              There is an error fetching your data. Try again later.
            </AlertDescription>
          </Box>
        </Alert>
      </Stack>
    )
  }

  if (
    !courseData ||
    !studentsCredentialsData?.students ||
    studentsCredentialsData?.students.length === 0
  ) {
    return (
      <Stack padding={8} borderRadius="xl" bg={'white'} boxShadow={'base'}>
        <Stack pb={2}>
          <Text fontWeight="semibold" fontSize="xl">
            Students list
          </Text>
        </Stack>
        <Alert status="info">
          <AlertIcon />
          <Box>
            <AlertTitle>Nothing to show.</AlertTitle>
            <AlertDescription>
              There are no teachers enrolled in this course
            </AlertDescription>
          </Box>
        </Alert>
      </Stack>
    )
  }

  return (
    <Stack padding={8} borderRadius="xl" bg={'white'} boxShadow={'base'}>
      <Stack spacing={4}>
        <Box pb={2}>
          <Text fontWeight="semibold" fontSize="xl">
            Students list
          </Text>
        </Box>
        <BaseCredentialRowList
          karmaAccessControlAddress={
            courseData.course.karma_access_control_address as Address
          }
          courseAddress={courseAddress}
          credentialType="DISCIPULUS"
          data={studentsCredentialsData.students}
          fetchNext={setSize}
          hasNext={hasMore}
          page={size}
        />
      </Stack>
    </Stack>
  )
}
