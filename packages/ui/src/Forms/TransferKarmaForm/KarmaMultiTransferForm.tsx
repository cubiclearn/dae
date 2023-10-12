import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Box,
  Button,
  Stack,
  useToast,
  FormControl,
  FormLabel,
  Input,
  FormErrorMessage,
  FormHelperText,
  Link,
} from '@chakra-ui/react'
import { useFormik } from 'formik'
import React, { useRef, useState } from 'react'
import { Address } from 'wagmi'
import * as Yup from 'yup'
import { TransferData, useKarmaBalances, useTransferKarma } from '@dae/wagmi'
import Papa from 'papaparse'
import { useCourseData } from '../../CourseProvider'
import { KarmaTransferSummaryTable } from './KarmaTransferSummaryTable'

const validationSchema = Yup.object().shape({
  CSVFile: Yup.mixed().required('CSV file is required'),
})

type KarmaMultiTransferFormProps = {
  onIsLoading: (_loading: boolean) => void
}

export const KarmaMultiTransferForm: React.FC<KarmaMultiTransferFormProps> = ({
  onIsLoading,
}) => {
  const { data } = useCourseData()
  const { multiTransfer, isLoading, isError, error, isSigning, isValidating } =
    useTransferKarma({
      karmaAccessControlAddress: data?.karma_access_control_address as Address,
    })
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const toast = useToast()

  const [csvData, setCsvData] = useState<TransferData[]>([])

  const {
    errors,
    touched,
    handleBlur,
    handleSubmit,
    setFieldValue,
    resetForm,
  } = useFormik({
    initialValues: {
      CSVFile: null,
    },
    onSubmit: async () => {
      onIsLoading(true)
      toast.promise(
        multiTransfer(csvData)
          .then(() => {
            if (fileInputRef.current) {
              fileInputRef.current.value = ''
            }
            setCsvData([])
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

  const { data: karmaBalances } = useKarmaBalances({
    karmaAccessControlAddress: data?.karma_access_control_address as Address,
    usersAddresses: csvData.map((row) => row.address as Address),
  })

  const handleCSVFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0]

    if (!file) {
      return
    }

    const text = await file.text()

    // Use PapaParse for CSV parsing
    Papa.parse<TransferData>(text, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
      complete: (results) => {
        setFieldValue('CSVFile', file)
        setCsvData(results.data)
      },
    })
  }

  return (
    <form onSubmit={handleSubmit}>
      <Stack spacing={6}>
        <FormControl
          isRequired
          isInvalid={!!errors.CSVFile && touched.CSVFile}
          isDisabled={isLoading || isValidating || isSigning}
        >
          <FormLabel>File (.csv)</FormLabel>
          <Input
            id="CSVFile"
            onChange={handleCSVFileChange}
            onBlur={handleBlur}
            type="file"
            py={1}
            ref={fileInputRef}
          />
          <FormHelperText>
            Click{' '}
            <Link
              isExternal
              fontWeight={'bold'}
              href="/files/multi_transfer_karma_example.csv"
            >
              here
            </Link>{' '}
            to download the example CSV file.
          </FormHelperText>
          <FormErrorMessage>{errors.CSVFile}</FormErrorMessage>
        </FormControl>
        {csvData.length > 0 && (
          <KarmaTransferSummaryTable
            usersKarmaIncrementData={csvData.map((row, index) => ({
              userAddress: row.address as Address,
              karmaIncrement: row.karma_increment,
              karmaBalance: Number(karmaBalances?.[index].result as bigint),
            }))}
          />
        )}
        <Button
          colorScheme="blue"
          type="submit"
          isLoading={isLoading || isSigning || isValidating}
          loadingText="Submitting"
        >
          Transfer Karma
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
