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
  credentialIPFSCid: Yup.string().required('Credential IPFS CID is required'),
})

type TransferCredentialsFormProps = {
  courseAddress: string
}

export const TransferCredentialsFormCopy: React.FC<
  TransferCredentialsFormProps
> = ({ courseAddress }) => {
  const { chain } = useNetwork()
  const { data } = useCourseCredentials(courseAddress as Address, chain?.id)

  const {
    transfer,
    isLoading,
    isError,
    isSuccess,
    error,
    isSigning,
    isValidating,
  } = useTransferCredentials(courseAddress as Address, 'OTHER')

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
      credentialIPFSCid: '',
    },
    onSubmit: async (values) => {
      try {
        await transfer(
          {
            address: values.userAddress as Address,
            email: '',
            discord: '',
          },
          values.credentialIPFSCid,
        )
        resetForm()
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
    <Box padding={8} borderRadius="xl" bg={'white'} boxShadow={'base'}>
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
              placeholder="Etereum Address"
            />
            <FormErrorMessage>{errors.userAddress}</FormErrorMessage>
          </FormControl>
          <FormControl
            isRequired
            isInvalid={!!errors.credentialIPFSCid && touched.credentialIPFSCid}
          >
            <FormLabel>Credential</FormLabel>
            <Select
              placeholder="Select the credential to transfer"
              onChange={(event: ChangeEvent<HTMLSelectElement>) => {
                setFieldValue('credentialIPFSCid', event.target.value)
              }}
            >
              {data ? (
                data
                  .filter((credential) => credential.type === 'OTHER')
                  .map((credential) => {
                    return (
                      <option
                        key={credential.ipfs_cid}
                        value={credential.ipfs_cid}
                      >
                        {credential.name}
                      </option>
                    )
                  })
              ) : (
                <></>
              )}
            </Select>
            <FormErrorMessage>{errors.credentialIPFSCid}</FormErrorMessage>
          </FormControl>
          <Button
            colorScheme="blue"
            type="submit"
            isLoading={isLoading || isSigning || isValidating}
            loadingText="Submitting"
          >
            Assign Credential
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
    </Box>
  )
}
