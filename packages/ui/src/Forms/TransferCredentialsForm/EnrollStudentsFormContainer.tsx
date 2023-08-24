import React, { useState } from 'react'
import { Box, FormControl, FormLabel, Stack, Switch } from '@chakra-ui/react'
import { EnrollStudentForm } from './EnrollStudentsForms/EnrollStudentForm'
import { EnrollStudentsForm } from './EnrollStudentsForms/EnrollStudentsForm'

type EnrollStudentsFormProps = {
  courseAddress: string
}

export const EnrollStudentsFormContainer: React.FC<EnrollStudentsFormProps> = ({
  courseAddress,
}) => {
  const [multiEnroll, setMultiEnroll] = useState(false)

  const handleMultiEnrollChange = () => {
    setMultiEnroll(!multiEnroll)
  }

  return (
    <Box padding={8} borderRadius="xl" bg={'white'} boxShadow={'base'}>
      <Stack spacing={8}>
        <FormControl display="flex" alignItems="center">
          <FormLabel htmlFor="email-alerts" mb="0">
            Multi enroll with CSV?
          </FormLabel>
          <Switch id="email-alerts" onChange={handleMultiEnrollChange} />
        </FormControl>
        {multiEnroll ? (
          <EnrollStudentsForm courseAddress={courseAddress} />
        ) : (
          <EnrollStudentForm courseAddress={courseAddress} />
        )}
      </Stack>
    </Box>
  )
}
