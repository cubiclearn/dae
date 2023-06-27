import {
  Box,
  Center,
  VStack,
  IconButton,
  Spinner,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from '@chakra-ui/react'
import { KarmaTransferStudentRow } from './KarmaTransferStudentRow'
import { FiPlus, FiMinus } from 'react-icons/fi'
import { useState } from 'react'
import { Address } from 'viem'
import { useCourseData } from '../../CourseProvider'

export const KarmaTransferForm = () => {
  const [rowCount, setRowCount] = useState(1) // Initial row count
  const { data, isLoading, error } = useCourseData()

  const addNewRow = () => {
    setRowCount((prevCount) => prevCount + 1) // Increment the row count
  }

  const removeRow = () => {
    setRowCount((prevCount) => (prevCount > 1 ? prevCount - 1 : prevCount)) // Decrement the row count, but ensure it doesn't go below 1
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

  if (isLoading || !data) {
    return (
      <Center>
        <Spinner />
      </Center>
    )
  }

  return (
    <Box padding={8} borderRadius='xl' borderColor='gray.300' borderWidth='1px'>
      <VStack spacing={4}>
        {Array.from({ length: rowCount }, (_, index) => (
          <KarmaTransferStudentRow
            key={index}
            karmaAccessControlAddress={
              data.karma_access_control_address as Address
            }
          />
        ))}
        <Center gap={4}>
          <IconButton
            aria-label='Add new row'
            icon={<FiPlus />}
            onClick={addNewRow}
          />
          {rowCount > 1 && (
            <IconButton
              aria-label='Remove row'
              icon={<FiMinus />}
              onClick={removeRow}
            />
          )}
        </Center>
      </VStack>
    </Box>
  )
}
