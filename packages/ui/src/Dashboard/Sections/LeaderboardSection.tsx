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
import { useCourseStudents, useKarmaBalances } from '@dae/wagmi'
import { Address } from 'viem'

type LeaderboardSectionProps = {
  chainId: number | undefined
  courseAddress: Address | undefined
  karmaAccessControlAddress: Address | undefined
}

export const LeaderboardSection: React.FC<LeaderboardSectionProps> = ({
  chainId,
  courseAddress,
  karmaAccessControlAddress,
}) => {
  const {
    data: studentsData,
    isLoading: isLoadingStudentsData,
    error: errorLoadingStudents,
  } = useCourseStudents(
    { courseAddress: courseAddress, chainId: chainId },
    { fetchAll: true },
  )

  const {
    data: studentsKarmaData,
    error: errorLoadingKarma,
    isLoading: isLoadingKarmaData,
  } = useKarmaBalances({
    usersAddresses: studentsData?.students.map(
      (student) => student.user_address as Address,
    ),
    karmaAccessControlAddress: karmaAccessControlAddress,
  })

  const studentsAddressAndKarmaOrderedDesc = useMemo(() => {
    if (studentsData && studentsKarmaData) {
      return studentsData.students
        .map((studentData, index) => {
          return {
            ...studentData,
            karma: Number(studentsKarmaData[index].result as bigint),
          }
        })
        .sort((studentA, studentB) => studentB.karma - studentA.karma)
    }
    return []
  }, [studentsData])

  if (isLoadingStudentsData || isLoadingKarmaData) {
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

  if (studentsData?.students.length === 0) {
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
            <Th>Email</Th>
            <Th>Discord</Th>
            <Th isNumeric>Karma</Th>
          </Tr>
        </Thead>
        <Tbody>
          {studentsAddressAndKarmaOrderedDesc.map((student, index) => {
            return (
              <Tr key={index}>
                <Td fontWeight={'semibold'}>{`#${index + 1}`}</Td>
                <Td>{student.user_address}</Td>
                <Td>{student.user_email}</Td>
                <Td>{student.user_discord_handle}</Td>
                <Td isNumeric>{student.karma}</Td>
              </Tr>
            )
          })}
        </Tbody>
      </Table>
    </TableContainer>
  )
}
