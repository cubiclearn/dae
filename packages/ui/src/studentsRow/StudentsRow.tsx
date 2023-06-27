import React from 'react'
import { Avatar, Text, Td, Tr } from '@chakra-ui/react'
import type { CourseStudents } from '@dae/database'

export type StudentsRowProps = {
  student: CourseStudents
}

export const StudentsRow: React.FC<StudentsRowProps> = ({ student }) => {
  return (
    <Tr>
      <Td>
        <Avatar src='' size={'sm'} />
      </Td>
      <Td>
        <Text verticalAlign={'center'} fontSize='md'>
          {student.studentAddress}
        </Text>
      </Td>
      <Td isNumeric>0</Td>
    </Tr>
  )
}
