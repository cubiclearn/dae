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
  Select,
  Stack,
  useToast,
} from '@chakra-ui/react'
import { useFormik } from 'formik'
import React, { ChangeEvent, useEffect } from 'react'
import { Address, useNetwork } from 'wagmi'
import * as Yup from 'yup'
import { useTransferCredentials } from '@dae/wagmi'
import { useCourseCredentials } from '@dae/wagmi'

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
  tokenURI: Yup.string().required('Credential IPFS CID is required'),
})

type TransferCredentialsFormProps = {
  courseAddress: string
}

export const TransferCredentialsForm: React.FC<TransferCredentialsFormProps> =
  ({ courseAddress }) => {
    const { chain } = useNetwork()
    const { data } = useCourseCredentials(courseAddress as Address, chain?.id)

    const { transfer, isLoading, isError, isSuccess, error, isSigning } =
      useTransferCredentials(courseAddress as Address)

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
        userEmail: '',
        userDiscordUsername: '',
        tokenURI: '',
      },
      onSubmit: async (values) => {
        try {
          await transfer(
            values.userAddress as Address,
            values.tokenURI,
            values.userDiscordUsername,
            values.userEmail,
          )
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
            <FormControl
              isRequired
              isInvalid={!!errors.tokenURI && touched.tokenURI}
            >
              <FormLabel>Credential</FormLabel>
              <Select
                placeholder='Select option'
                onChange={(event: ChangeEvent<HTMLSelectElement>) => {
                  setFieldValue('tokenURI', event.target.value)
                }}
              >
                {data ? (
                  data.map((credential) => {
                    return (
                      <option
                        key={credential.ipfs_cid}
                        value={credential.ipfs_url}
                      >
                        {credential.name}
                      </option>
                    )
                  })
                ) : (
                  <></>
                )}
              </Select>
              <FormErrorMessage>{errors.tokenURI}</FormErrorMessage>
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
