import React from 'react'
import { Flex, Avatar, Text } from '@chakra-ui/react'
import type { CourseStudents } from '@dae/database'

export type StudentsRowProps = {
  student: CourseStudents
}

export const StudentsRow: React.FC<StudentsRowProps> = ({ student }) => {
  return (
    <Flex
      key={student.studentAddress}
      border={'1px'}
      borderColor={'gray.300'}
      rounded={'lg'}
      paddingY={2}
      paddingX={3}
      shadow={'0 0 1px rgba(0, 0, 0, 0.3)'}
    >
      <Avatar src='' size={'sm'} />
      <Flex ml='4' alignItems={'center'}>
        <Text verticalAlign={'center'} fontSize='md'>
          {student.studentAddress}
        </Text>
      </Flex>
    </Flex>
  )
}
