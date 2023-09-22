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
} from '@chakra-ui/react'
import { useFormik } from 'formik'
import React from 'react'
import { Address, useNetwork } from 'wagmi'
import * as Yup from 'yup'
import { useCourseCredentials, useTransferCredentials } from '@dae/wagmi'
import { useFormFeedback } from '../../../hooks'

const ethereumAddressRegex = /^0x([A-Fa-f0-9]{40})$/

type TransferCredentialFormProps = {
  courseAddress: string
  credentialType: 'MAGISTER' | 'DISCIPULUS'
}

const validationSchema = Yup.object().shape({
  userAddress: Yup.string()
    .matches(ethereumAddressRegex, 'Invalid Ethereum address')
    .required('Ethereum address is required'),
  userEmail: Yup.string().email('Invalid email'),
  userDiscordUsername: Yup.string(),
})

export const BaseCredentialSingleTransferForm: React.FC<
  TransferCredentialFormProps
> = ({ courseAddress, credentialType }) => {
  const { chain } = useNetwork()
  const { data } = useCourseCredentials(
    courseAddress as Address,
    chain?.id,
    credentialType,
  )

  const {
    transfer,
    isLoading,
    isError,
    isSuccess,
    error,
    isSigning,
    isValidating,
  } = useTransferCredentials(courseAddress as Address, credentialType)

  const {
    values,
    errors,
    touched,
    handleBlur,
    handleChange,
    handleSubmit,
    handleReset,
    resetForm,
  } = useFormik({
    initialValues: {
      userAddress: '',
      userEmail: '',
      userDiscordUsername: '',
    },
    onSubmit: async (values) => {
      try {
        if (data) {
          await transfer(
            {
              address: values.userAddress as Address,
              email: values.userEmail,
              discord: values.userDiscordUsername,
            },
            data.credentials[0].ipfs_cid,
          )
          resetForm()
        }
      } catch (_e) {}
    },
    validationSchema: validationSchema,
  })

  useFormFeedback({ isError, isSuccess, isLoading })

  return (
    <form onSubmit={handleSubmit}>
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
            placeholder="Ethereum Address"
            onReset={handleReset}
          />
          <FormErrorMessage>{errors.userAddress}</FormErrorMessage>
        </FormControl>
        <FormControl isInvalid={!!errors.userEmail && touched.userEmail}>
          <FormLabel>E-mail</FormLabel>
          <Input
            id="userEmail"
            value={values.userEmail}
            onChange={handleChange}
            onBlur={handleBlur}
            type="text"
            placeholder="Email"
            onReset={handleReset}
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
            id="userDiscordUsername"
            value={values.userDiscordUsername}
            onChange={handleChange}
            onBlur={handleBlur}
            type="text"
            placeholder="Discord username"
            onReset={handleReset}
          />
          <FormErrorMessage>{errors.userDiscordUsername}</FormErrorMessage>
        </FormControl>
        <Button
          colorScheme="blue"
          type="submit"
          isLoading={isLoading || isSigning || isValidating}
          loadingText="Submitting"
        >
          {credentialType === 'MAGISTER' ? 'Enroll teacher' : 'Enroll student'}
        </Button>
        {isError ? (
          <Alert status="error">
            <AlertIcon />
            <Box>
              <AlertTitle>Something went wrong.</AlertTitle>
              <AlertDescription>{error?.message}</AlertDescription>
            </Box>
          </Alert>
        ) : (
          <></>
        )}
      </Stack>
    </form>
  )
}
