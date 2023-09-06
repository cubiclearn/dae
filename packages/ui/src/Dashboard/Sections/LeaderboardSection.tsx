import {
  Center,
  Spinner,
  Alert,
  AlertIcon,
  Box,
  AlertTitle,
  AlertDescription,
  Table,
  TableCaption,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from '@chakra-ui/react'
import React, { useMemo } from 'react'
import { useCourseStudents, useCourseStudentsKarma } from '@dae/wagmi'
import { Address } from 'viem'
import { Course } from '@dae/database'

type LeaderboardSectionProps = {
  chainId: number | undefined
  courseAddress: Address | undefined
  courseData: Course | undefined
}

export const LeaderboardSection: React.FC<LeaderboardSectionProps> = ({
  chainId,
  courseAddress,
  courseData,
}) => {
  const {
    data: studentsData,
    isLoading: isLoadingStudentsData,
    error: errorLoadingStudents,
  } = useCourseStudents(courseAddress, chainId)

  const karmaAccessControlAddress =
    (courseData?.karma_access_control_address as Address) || undefined

  const studentsAddresses =
    studentsData?.data.students.map(
      (student) => student.user_address as Address,
    ) || []

  const {
    data: studentsKarmaData,
    error: errorLoadingKarma,
    isLoading: isLoadingKarmaData,
  } = useCourseStudentsKarma(
    studentsAddresses,
    karmaAccessControlAddress,
    chainId,
  )

  const studentsAddressAndKarmaOrderedDesc = useMemo(
    () =>
      studentsKarmaData && courseData
        ? studentsAddresses
            .map((studentAddress, index) => {
              return [studentAddress, studentsKarmaData[index]]
            })
            .sort(
              (studentA, studentB) => Number(studentB[1]) - Number(studentA[1]),
            )
        : undefined,
    [studentsKarmaData, courseData],
  )

  if (studentsData?.data.students.length === 0) {
    return (
      <Alert status="warning">
        <AlertIcon />
        <Box>
          <AlertTitle>Warning</AlertTitle>
          <AlertDescription>
            Cannot display leaderboard table without any student enrolled to the
            course.
          </AlertDescription>
        </Box>
      </Alert>
    )
  }

  if (
    isLoadingStudentsData ||
    isLoadingKarmaData ||
    (studentsData === undefined && !errorLoadingStudents) ||
    studentsAddressAndKarmaOrderedDesc === undefined
  ) {
    return (
      <Center>
        <Spinner />
      </Center>
    )
  }

  if (errorLoadingStudents || errorLoadingKarma) {
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

  return (
    <TableContainer
      borderRadius={'lg'}
      borderWidth={'1px'}
      padding={4}
      background={'white'}
      boxShadow={'md'}
    >
      <Table variant="simple">
        <TableCaption>
          Students of this course ranked by karma amount
        </TableCaption>
        <Thead>
          <Tr>
            <Th>Rank</Th>
            <Th>Address</Th>
            <Th isNumeric>Karma</Th>
          </Tr>
        </Thead>
        <Tbody>
          {studentsAddressAndKarmaOrderedDesc.map((student, index) => {
            return (
              <Tr key={index}>
                <Td fontWeight={'semibold'}>{`#${index + 1}`}</Td>
                <Td>{student[0]}</Td>
                <Td isNumeric>{student[1]}</Td>
              </Tr>
            )
          })}
        </Tbody>
      </Table>
    </TableContainer>
  )
}
