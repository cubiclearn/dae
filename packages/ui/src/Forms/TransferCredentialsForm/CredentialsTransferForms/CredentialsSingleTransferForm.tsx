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
import React, { ChangeEvent } from 'react'
import { Address, useNetwork } from 'wagmi'
import * as Yup from 'yup'
import { useCourseCredentials, useTransferCredentials } from '@dae/wagmi'
import { ETHEREUM_ADDRESS_REGEX } from '../../../constants'
import { useLeavePageConfirmation } from '../../../hooks'

type TransferCredentialFormProps = {
  courseAddress: Address
}

const validationSchema = Yup.object().shape({
  userAddress: Yup.string()
    .matches(ETHEREUM_ADDRESS_REGEX, 'Invalid Ethereum address')
    .required('Ethereum address is required'),
  credentialIPFSCid: Yup.string().required('You have to select a credential'),
})

export const CredentialsSingleTransferForm: React.FC<
  TransferCredentialFormProps
> = ({ courseAddress }) => {
  const { chain } = useNetwork()
  const { data } = useCourseCredentials(courseAddress, chain?.id, 'OTHER')
  const toast = useToast()

  const { transfer, isLoading, isError, error, isSigning, isValidating } =
    useTransferCredentials(courseAddress, 'OTHER')

  useLeavePageConfirmation(isLoading, 'Changes you made may not be saved.')

  const {
    values,
    errors,
    touched,
    handleBlur,
    handleChange,
    handleSubmit,
    handleReset,
    setFieldValue,
    resetForm,
  } = useFormik({
    initialValues: {
      credentialIPFSCid: '',
      userAddress: '',
    },
    onSubmit: async (values) => {
      try {
        if (!data) return
        toast.promise(
          transfer(
            {
              address: values.userAddress as Address,
            },
            values.credentialIPFSCid,
          ),
          {
            success: {
              title: 'Credential transferred with success!',
            },
            error: { title: 'Error transferring credential.' },
            loading: {
              title: 'Credential transfer in progress...',
              description:
                'Processing transaction on the blockchain can take some time (usually around one minute).',
              onCloseComplete: () => {
                resetForm()
              },
            },
          },
        )
      } catch (_e) {}
    },
    validationSchema: validationSchema,
  })

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
            onReset={handleReset}
          >
            {data ? (
              data.credentials.map((credential) => {
                return (
                  <option key={credential.ipfs_cid} value={credential.ipfs_cid}>
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
          Transfer credential
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
