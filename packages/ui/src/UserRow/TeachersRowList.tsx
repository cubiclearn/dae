import React from 'react'
import { Table, TableContainer, Tbody, Th, Thead, Tr } from '@chakra-ui/react'
import { UserRow } from './UserRow'
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
import { useCourseTeachers } from '@dae/wagmi'
import { Address, useNetwork } from 'wagmi'

interface TeachersRowListProps {
  courseAddress: Address
}

export const TeachersRowList: React.FC<TeachersRowListProps> = ({
  courseAddress,
}) => {
  const { chain } = useNetwork()

  const {
    data: response,
    error,
    isLoading,
  } = useCourseTeachers(courseAddress, chain?.id)

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

  if (!response || response.data.teachers.length === 0) {
    return (
      <Alert status='info'>
        <AlertIcon />
        <Box>
          <AlertTitle>Nothing to show.</AlertTitle>
          <AlertDescription>
            There are no teachers enrolled in this course
          </AlertDescription>
        </Box>
      </Alert>
    )
  }

  return (
    <Box padding={8} borderRadius='xl' bg={'white'} boxShadow={'base'}>
      <Box pb={2}>
        <Text fontWeight='semibold' fontSize='xl'>
          Teachers list
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
            {response.data.teachers.map((teacher) => (
              <UserRow key={teacher.user_address} user={teacher} />
            ))}
          </Tbody>
        </Table>
      </TableContainer>
    </Box>
  )
}
