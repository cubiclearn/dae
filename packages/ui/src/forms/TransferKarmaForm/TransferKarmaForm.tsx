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
import { useKarmaBalance, useTransferKarma } from '@dae/wagmi'
import { useCourseData } from '../../CourseProvider'
import { isAddress } from 'viem'
import { KarmaCounter } from './KarmaCounter'

const ethereumAddressRegex = /^0x([A-Fa-f0-9]{40})$/

const validationSchema = Yup.object().shape({
  userAddress: Yup.string()
    .matches(ethereumAddressRegex, 'Invalid Ethereum address')
    .required('Ethereum address is required'),
  karmaIncrement: Yup.number().required('Karma increment value is required'),
})

export const TransferKarmaForm: React.FC<any> = () => {
  const { data } = useCourseData()
  const { transfer, isLoading, isError, isSuccess, error, isSigning } =
    useTransferKarma(
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

  const { data: karmaBalance } = useKarmaBalance(
    data ? (data.karma_access_control_address as Address) : undefined,
    isAddress(values.userAddress) ? values.userAddress : undefined,
  )

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
              Tranfer Karma
            </Text>
            <Text fontSize='lg'>
              Please complete all the required fields to initiate a karma
              transfer to another user.
            </Text>
          </Box>
          <Stack direction={'row'} spacing={'30px'}>
            <Stack width={'80%'} spacing={'10px'}>
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
                <FormLabel>Karma increment</FormLabel>
                <NumberInput
                  allowMouseWheel
                  defaultValue={0}
                  min={karmaBalance ? -Number(karmaBalance) : 0}
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
            </Stack>
            <Box width={'20%'}>
              <KarmaCounter karmaAmount={Number(karmaBalance)} />
            </Box>
          </Stack>

          <Button
            colorScheme='blue'
            type='submit'
            isLoading={isLoading || isSigning}
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
