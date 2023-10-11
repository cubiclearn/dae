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
  useToast,
} from '@chakra-ui/react'
import { useFormik } from 'formik'
import React, { useCallback } from 'react'
import { Address } from 'wagmi'
import * as Yup from 'yup'
import {
  useBaseKarma,
  useHasAccess,
  useKarmaBalance,
  useTransferKarma,
} from '@dae/wagmi'
import { useCourseData } from '../../CourseProvider'
import { isAddress } from 'viem'
import { KarmaTransferSummaryTable } from './KarmaTransferSummaryTable/KarmaTransferSummaryTable'

const ethereumAddressRegex = /^0x([A-Fa-f0-9]{40})$/

const validationSchema = Yup.object().shape({
  userAddress: Yup.string()
    .matches(ethereumAddressRegex, 'Invalid Ethereum address')
    .required('Ethereum address is required'),
  karmaIncrement: Yup.number()
    .notOneOf([0], 'Karma increment value cannot be 0')
    .required('Karma increment value is required'),
})

type KarmaSingleTransferFormProps = {
  onIsLoading: (_loading: boolean) => void
}

export const KarmaSingleTransferForm: React.FC<KarmaSingleTransferFormProps> =
  ({ onIsLoading }) => {
    const toast = useToast()
    const { data: courseData } = useCourseData()
    const { transfer, isLoading, isError, error, isSigning, isValidating } =
      useTransferKarma(courseData?.karma_access_control_address as Address)

    const {
      values,
      errors,
      touched,
      handleBlur,
      handleChange,
      handleSubmit,
      setFieldValue,
      resetForm,
    } = useFormik<{ userAddress: string; karmaIncrement: number }>({
      initialValues: {
        userAddress: '',
        karmaIncrement: 1,
      },
      onSubmit: async (values) => {
        onIsLoading(true)
        toast.promise(
          transfer(values.userAddress as Address, values.karmaIncrement)
            .then(() => {
              resetForm()
            })
            .finally(() => {
              onIsLoading(false)
            }),
          {
            success: {
              title: 'Karma transferred with success!',
            },
            error: { title: 'Error transferring karma.' },
            loading: {
              title: 'Karma transfer in progress...',
              description:
                'Processing transaction on the blockchain can take some time (usually around one minute).',
            },
          },
        )
      },
      validationSchema: validationSchema,
    })

    const { data: userHasAccess } = useHasAccess({
      courseAddress: courseData?.address as Address,
      userAddress: isAddress(values.userAddress)
        ? values.userAddress
        : undefined,
    })

    const { data: userKarmaBalance } = useKarmaBalance({
      karmaAccessControlAddress:
        courseData?.karma_access_control_address as Address,
      userAddress: isAddress(values.userAddress)
        ? values.userAddress
        : undefined,
    })

    const { data: userBaseKarma } = useBaseKarma({
      karmaAccessControlAddress:
        courseData?.karma_access_control_address as Address,
      userAddress: isAddress(values.userAddress)
        ? values.userAddress
        : undefined,
    })

    const handleChangeKarmaIncrementValue = useCallback(
      (_valueAsString: string, valueAsNumber: number) => {
        if (Number.isNaN(valueAsNumber)) {
          setFieldValue('karmaIncrement', 0)
        } else {
          setFieldValue('karmaIncrement', valueAsNumber)
        }
      },
      [],
    )

    return (
      <form onSubmit={handleSubmit}>
        <Stack spacing={8}>
          <Stack spacing={4}>
            <FormControl
              isRequired
              isInvalid={
                touched.userAddress && (!!errors.userAddress || !userHasAccess)
              }
              isDisabled={isLoading || isValidating || isSigning}
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
              <FormErrorMessage>
                {errors.userAddress ||
                  (!userHasAccess &&
                    'The provided address does not correspond to an enrolled course participant.')}
              </FormErrorMessage>
            </FormControl>
            <FormControl
              isRequired
              isInvalid={!!errors.karmaIncrement && touched.karmaIncrement}
              isDisabled={isLoading || isValidating || isSigning}
            >
              <FormLabel>Karma increment</FormLabel>
              <NumberInput
                allowMouseWheel
                defaultValue={0}
                min={Math.min(
                  (userKarmaBalance &&
                    userBaseKarma &&
                    -Number(userKarmaBalance - userBaseKarma)) ??
                    1,
                  1,
                )}
                id="karmaIncrement"
                onChange={handleChangeKarmaIncrementValue}
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
          {userHasAccess && (
            <KarmaTransferSummaryTable
              usersKarmaIncrementData={[
                {
                  userAddress: values.userAddress as Address,
                  karmaIncrement: values.karmaIncrement,
                },
              ]}
            />
          )}
          <Button
            colorScheme="blue"
            type="submit"
            isLoading={isLoading || isSigning || isValidating}
            loadingText="Submitting"
          >
            Transfer karma
          </Button>
          {isError && (
            <Alert status="error">
              <AlertIcon />
              <Box>
                <AlertTitle>Something went wrong.</AlertTitle>
                <AlertDescription>{error?.message}</AlertDescription>
              </Box>
            </Alert>
          )}
        </Stack>
      </form>
    )
  }
