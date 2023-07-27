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
  Stack,
  Text,
  useToast,
} from '@chakra-ui/react'
import { useFormik } from 'formik'
import React, { useEffect } from 'react'
import { Address } from 'wagmi'
import * as Yup from 'yup'
import { useTransferCredentials } from '@dae/wagmi'
import { useRouter } from 'next/router'
const ethereumAddressRegex = /^0x([A-Fa-f0-9]{40})$/

const validationSchema = Yup.object().shape({
  userAddress: Yup.string()
    .matches(ethereumAddressRegex, 'Invalid Ethereum address')
    .required('Ethereum address is required'),
  userEmail: Yup.string().email('Invalid email'),
  userDiscordUsername: Yup.string().matches(
    /^[a-zA-Z0-9_]{1,32}#[0-9]{4}$/,
    'Invalid Discord username',
  ),
})

type TransferCredentialsFormProps = {
  courseAddress: string
}

export const EnrollStudentsForm: React.FC<TransferCredentialsFormProps> = ({
  courseAddress,
}) => {
  const router = useRouter()
  const { transfer, isLoading, isError, isSuccess, error, isSigning } =
    useTransferCredentials(courseAddress as Address)

  const toast = useToast()

  const { values, errors, touched, handleBlur, handleChange, handleSubmit } =
    useFormik({
      initialValues: {
        userAddress: '',
        userEmail: '',
        userDiscordUsername: '',
      },
      onSubmit: async (values) => {
        try {
          await transfer(
            values.userAddress as Address,
            'https://dae-demo.infura-ipfs.io/ipfs/QmPfKCv7ZAz8294ShRTcHft5LSM9YaDJ4NTjZisCkhFxW8',
            values.userDiscordUsername,
            values.userEmail,
          )
          router.push(`/course/${courseAddress}/students/list`)
        } catch (_e) {}
      },
      validationSchema: validationSchema,
    })

  useEffect(() => {
    if (isError) {
      toast({
        title: 'Error transferring credential.',
        status: 'error',
      })
    }
    if (isSuccess) {
      toast({
        title: 'Credential transferred with success!',
        status: 'success',
      })
    }
    if (isLoading) {
      toast({
        title: 'Transferring selected credential...',
        status: 'info',
      })
    }
  }, [isLoading, isError, isSuccess])

  return (
    <Box padding={8} borderRadius='xl' bg={'white'} boxShadow={'base'}>
      <form onSubmit={handleSubmit}>
        <Stack spacing={4}>
          <Box>
            <Text fontWeight='semibold' fontSize='3xl'>
              Enroll student
            </Text>
            <Text fontSize='lg'>
              Fill in all the form fields to enroll a new student to this
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
          <FormControl isInvalid={!!errors.userEmail && touched.userEmail}>
            <FormLabel>E-mail</FormLabel>
            <Input
              id='userEmail'
              value={values.userEmail}
              onChange={handleChange}
              onBlur={handleBlur}
              type='text'
              placeholder='Email'
            />
            <FormErrorMessage>{errors.userEmail}</FormErrorMessage>
          </FormControl>
          <FormControl
            isInvalid={
              !!errors.userDiscordUsername && touched.userDiscordUsername
            }
          >
            <FormLabel>Discord Username</FormLabel>
            <Input
              id='userDiscordUsername'
              value={values.userDiscordUsername}
              onChange={handleChange}
              onBlur={handleBlur}
              type='text'
              placeholder='Discord username'
            />
            <FormErrorMessage>{errors.userDiscordUsername}</FormErrorMessage>
          </FormControl>
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
