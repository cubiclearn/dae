import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Box,
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  Stack,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  Text,
  useToast,
} from '@chakra-ui/react'
import { useFormik } from 'formik'
import React, { useEffect } from 'react'
import { Address } from 'wagmi'
import * as Yup from 'yup'
import { useKarmaBalance, useTransferKarma } from '@dae/wagmi'
import { useCourseData } from '../../CourseProvider'
import { isAddress } from 'viem'

const ethereumAddressRegex = /^0x([A-Fa-f0-9]{40})$/

const validationSchema = Yup.object().shape({
  userAddress: Yup.string()
    .matches(ethereumAddressRegex, 'Invalid Ethereum address')
    .required('Ethereum address is required'),
  karmaIncrement: Yup.number().required('Karma increment value is required'),
})

export const TransferKarmaForm: React.FC<any> = () => {
  const { data } = useCourseData()
  const {
    transfer,
    isLoading,
    isError,
    isSuccess,
    error,
    isSigning,
    isValidating,
  } = useTransferKarma(
    data ? (data.karma_access_control_address as Address) : undefined,
  )

  const toast = useToast()

  const {
    values,
    errors,
    touched,
    handleBlur,
    handleChange,
    handleSubmit,
    setFieldValue,
    resetForm,
  } = useFormik({
    initialValues: {
      userAddress: '',
      karmaIncrement: 1,
    },
    onSubmit: async (values) => {
      try {
        await transfer(values.userAddress as Address, values.karmaIncrement)
        resetForm()
      } catch (_e) {}
    },
    validationSchema: validationSchema,
  })

  const { data: karmaBalance } = useKarmaBalance(
    data ? (data.karma_access_control_address as Address) : undefined,
    isAddress(values.userAddress) ? values.userAddress : undefined,
  )

  useEffect(() => {
    if (isError) {
      toast({
        title: 'Error transferring karma.',
        status: 'error',
      })
    }
    if (isSuccess) {
      toast({
        title: 'Karma transferred with success!',
        status: 'success',
      })
    }
    if (isLoading) {
      toast({
        title: 'Transferring karma...',
        status: 'info',
      })
    }
  }, [isLoading, isError, isSuccess])

  return (
    <form onSubmit={handleSubmit}>
      <Stack spacing={8}>
        <Stack spacing={4}>
          <FormControl
            isRequired
            isInvalid={!!errors.userAddress && touched.userAddress}
          >
            <FormLabel>Ethereum Address</FormLabel>
            <Input
              id="userAddress"
              value={values.userAddress}
              onChange={handleChange}
              onBlur={handleBlur}
              type="text"
              placeholder="Etereum Address"
            />
            <FormErrorMessage>{errors.userAddress}</FormErrorMessage>
          </FormControl>
          <FormControl
            isRequired
            isInvalid={!!errors.karmaIncrement && touched.karmaIncrement}
          >
            <FormLabel>Karma increment</FormLabel>
            <NumberInput
              allowMouseWheel
              defaultValue={0}
              min={karmaBalance ? -Number(karmaBalance) : 0}
              id="karmaIncrement"
              onChange={(_valueAsString, valueAsNumber) => {
                if (isNaN(valueAsNumber)) {
                  setFieldValue('karmaIncrement', 0) // Set to a default value or any other appropriate value
                } else {
                  setFieldValue('karmaIncrement', valueAsNumber)
                }
              }}
              value={values.karmaIncrement}
              onBlur={handleBlur}
            >
              <NumberInputField />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
            <FormErrorMessage>{errors.karmaIncrement}</FormErrorMessage>
          </FormControl>
        </Stack>
        {values.userAddress !== '' ? (
          <Stack>
            <Text fontWeight={'semibold'}>Summary</Text>
            <TableContainer>
              <Table>
                <Thead>
                  <Tr>
                    <Th>Address</Th>
                    <Th>Karma</Th>
                    <Th>Increment</Th>
                    <Th>Total</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  <Tr>
                    <Td>{values.userAddress}</Td>
                    <Td>{Number(karmaBalance) ?? '--'}</Td>
                    <Td
                      color={
                        values.karmaIncrement > 0 ? 'green.500' : 'red.500'
                      }
                    >
                      {values.karmaIncrement > 0
                        ? `+${Number(values.karmaIncrement)}`
                        : `${Number(values.karmaIncrement)}`}
                    </Td>
                    <Td>{Number(karmaBalance) + values.karmaIncrement}</Td>
                  </Tr>
                </Tbody>
              </Table>
            </TableContainer>
          </Stack>
        ) : (
          <></>
        )}

        <Button
          colorScheme="blue"
          type="submit"
          isLoading={isLoading || isSigning || isValidating}
          loadingText="Submitting"
        >
          Transfer karma
        </Button>
        {isError ? (
          <Alert status="error">
            <AlertIcon />
            <Box>
              <AlertTitle>Something went wrong.</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Box>
          </Alert>
        ) : (
          <></>
        )}
      </Stack>
    </form>
  )
}
