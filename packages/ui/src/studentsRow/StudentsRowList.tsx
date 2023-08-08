import React from 'react'
import { Table, TableContainer, Tbody, Th, Thead, Tr } from '@chakra-ui/react'
import { StudentsRow } from './StudentsRow'
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
import { useCourseStudents } from '@dae/wagmi'
import { Address, useNetwork } from 'wagmi'

interface StudentsRowListProps {
  courseAddress: Address
}

export const StudentsRowList: React.FC<StudentsRowListProps> = ({
  courseAddress,
}) => {
  const { chain } = useNetwork()

  const {
    data: response,
    error,
    isLoading,
  } = useCourseStudents(courseAddress, chain?.id)

  if (isLoading) {
    return (
      <Center>
        <Spinner />
      </Center>
    )
  }

  if (error) {
    return (
      <Alert status='error'>
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

  if (!response || response.data.students.length === 0) {
    return (
      <Alert status='info'>
        <AlertIcon />
        <Box>
          <AlertTitle>Nothing to show.</AlertTitle>
          <AlertDescription>
            There are no students enrolled in this course
          </AlertDescription>
        </Box>
      </Alert>
    )
  }

  return (
    <Box padding={8} borderRadius='xl' bg={'white'} boxShadow={'base'}>
      <Box pb={2}>
        <Text fontWeight='semibold' fontSize='xl'>
          Students list
        </Text>
      </Box>
      <TableContainer>
        <Table variant='simple'>
          <Thead>
            <Tr>
              <Th>{''}</Th>
              <Th>Address</Th>
              <Th>E-mail</Th>
              <Th>Discord</Th>
              <Th isNumeric>Karma</Th>
            </Tr>
          </Thead>
          <Tbody>
            {response.data.students.map((student) => (
              <StudentsRow key={student.user_address} student={student} />
            ))}
          </Tbody>
        </Table>
      </TableContainer>
    </Box>
  )
}
