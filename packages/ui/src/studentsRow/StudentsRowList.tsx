import React from 'react'
import useSWR, { SWRResponse } from 'swr'
import { Table, TableContainer, Tbody, Th, Thead, Tr } from '@chakra-ui/react'
import { StudentsRow } from './StudentsRow'
import type { CourseStudents } from '@dae/database'
import {
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Box,
  Center,
  Spinner,
} from '@chakra-ui/react'

interface StudentsRowListProps {
  api_url: string
}

const fetcher = (url: string): Promise<CourseStudents[]> =>
  fetch(url).then((r) => r.json())

export const StudentsRowList: React.FC<StudentsRowListProps> = ({
  api_url,
}) => {
  const {
    data,
    error,
    isLoading,
  }: SWRResponse<CourseStudents[], any, boolean> = useSWR(api_url, fetcher)

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

  if (!data || data.length === 0) {
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
    <TableContainer>
      <Table variant='simple'>
        <Thead>
          <Tr>
            <Th>Icon</Th>
            <Th>Student Address</Th>
            <Th isNumeric>Karma</Th>
          </Tr>
        </Thead>
        <Tbody>
          {data.map((student) => (
            <StudentsRow key={student.studentAddress} student={student} />
          ))}
        </Tbody>
      </Table>
    </TableContainer>
  )
}
