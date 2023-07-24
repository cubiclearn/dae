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
  Text,
  useToast,
} from '@chakra-ui/react'
import { useFormik } from 'formik'
import React, { useEffect } from 'react'
import { Address } from 'wagmi'
import * as Yup from 'yup'
import { useTransferKarma } from '@dae/wagmi'
import { useCourseData } from '../../CourseProvider'

const ethereumAddressRegex = /^0x([A-Fa-f0-9]{40})$/

const validationSchema = Yup.object().shape({
  userAddress: Yup.string()
    .matches(ethereumAddressRegex, 'Invalid Ethereum address')
    .required('Ethereum address is required'),
  karmaIncrement: Yup.number().required('Karma increment value is required'),
})

export const TransferKarmaForm: React.FC<any> = () => {
  const { data } = useCourseData()
  const { transfer, isLoading, isError, isSuccess, error } = useTransferKarma(
    data?.karma_access_control_address as Address | undefined,
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
  } = useFormik({
    initialValues: {
      userAddress: '',
      karmaIncrement: 1,
    },
    onSubmit: async (values) => {
      try {
        await transfer(values.userAddress as Address, values.karmaIncrement)
      } catch (_e) {}
    },
    validationSchema: validationSchema,
  })

  useEffect(() => {
    if (isError) {
      toast({
        title: 'Error creating credential.',
        status: 'error',
      })
    }
    if (isSuccess) {
      toast({
        title: 'Credential created with success!',
        status: 'success',
      })
    }
    if (isLoading) {
      toast({
        title: 'Creating new credential...',
        status: 'info',
      })
    }
  }, [isLoading, isError, isSuccess])

  return (
    <Box padding={8} borderRadius='xl' borderColor='gray.300' borderWidth='1px'>
      <form onSubmit={handleSubmit}>
        <Stack spacing={4}>
          <Box>
            <Text fontWeight='semibold' fontSize='3xl'>
              Create credentials form
            </Text>
            <Text fontSize='lg'>
              Fill in all the form fields to create a new credential for this
              course!
            </Text>
          </Box>
          <FormControl
            isRequired
            isInvalid={!!errors.userAddress && touched.userAddress}
          >
            <FormLabel>Ethereum Address</FormLabel>
            <Input
              id='userAddress'
              value={values.userAddress}
              onChange={handleChange}
              onBlur={handleBlur}
              type='text'
              placeholder='Etereum Address'
            />
            <FormErrorMessage>{errors.userAddress}</FormErrorMessage>
          </FormControl>
          <FormControl
            isRequired
            isInvalid={!!errors.karmaIncrement && touched.karmaIncrement}
          >
            <FormLabel>Magister base karma</FormLabel>
            <NumberInput
              allowMouseWheel
              defaultValue={0}
              id='karmaIncrement'
              onChange={(_valueAsString, valueAsNumber) =>
                setFieldValue('karmaIncrement', valueAsNumber)
              }
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
          <Button
            colorScheme='blue'
            type='submit'
            isLoading={isLoading}
            loadingText='Submitting'
          >
            Assign Credential
          </Button>
          {isError ? (
            <Alert status='error'>
              <AlertIcon />
              <Box>
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Box>
            </Alert>
          ) : (
            <></>
          )}
        </Stack>
      </form>
    </Box>
  )
}
