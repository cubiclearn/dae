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
import { useCourseCredentials, useTransferCredentials } from '@dae/wagmi'
import { CredentialType } from '@dae/database'
const ethereumAddressRegex = /^0x([A-Fa-f0-9]{40})$/

const validationSchema = Yup.object().shape({
  userAddress: Yup.string()
    .matches(ethereumAddressRegex, 'Invalid Ethereum address')
    .required('Ethereum address is required'),
  userEmail: Yup.string().email('Invalid email'),
  userDiscordUsername: Yup.string(),
  credentialIPFSCid: Yup.string().required('Credential IPFS CID is required'),
})

type TransferCredentialFormProps = {
  courseAddress: string
  credentialType: CredentialType
}

export const TransferCredentialForm: React.FC<TransferCredentialFormProps> = ({
  courseAddress,
  credentialType,
}) => {
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
      credentialIPFSCid: '',
      userAddress: '',
      userEmail: '',
      userDiscordUsername: '',
    },
    onSubmit: async (values) => {
      try {
        if (data) {
          const credentialCID =
            credentialType === 'DISCIPULUS' || credentialType === 'MAGISTER'
              ? data[0].ipfs_cid
              : values.credentialIPFSCid

          await transfer(
            {
              address: values.userAddress as Address,
              email: values.userEmail,
              discord: values.userDiscordUsername,
            },
            credentialCID,
          )
        }
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
          />
          <FormErrorMessage>{errors.userAddress}</FormErrorMessage>
        </FormControl>
        {credentialType === 'DISCIPULUS' || credentialType === 'MAGISTER' ? (
          <FormControl isInvalid={!!errors.userEmail && touched.userEmail}>
            <FormLabel>E-mail</FormLabel>
            <Input
              id="userEmail"
              value={values.userEmail}
              onChange={handleChange}
              onBlur={handleBlur}
              type="text"
              placeholder="Email"
            />
            <FormErrorMessage>{errors.userEmail}</FormErrorMessage>
          </FormControl>
        ) : (
          <></>
        )}
        {credentialType === 'DISCIPULUS' || credentialType === 'MAGISTER' ? (
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
            />
            <FormErrorMessage>{errors.userDiscordUsername}</FormErrorMessage>
          </FormControl>
        ) : (
          <></>
        )}
        {credentialType === 'OTHER' ? (
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
                data.map((credential) => {
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
        ) : (
          <></>
        )}
        <Button
          colorScheme="blue"
          type="submit"
          isLoading={isLoading || isSigning || isValidating}
          loadingText="Submitting"
        >
          Enroll student
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
