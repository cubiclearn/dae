import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Box,
  Button,
  Stack,
  FormControl,
  FormLabel,
  Input,
  FormErrorMessage,
  TableContainer,
  Table,
  Th,
  Thead,
  Tr,
  Tbody,
  Td,
  Text,
  FormHelperText,
  Link,
  Select,
} from '@chakra-ui/react'
import { useFormik } from 'formik'
import React, { ChangeEvent, useCallback, useRef, useState } from 'react'
import { Address, useNetwork } from 'wagmi'
import * as Yup from 'yup'
import {
  useTransferCredentials,
  TransferCredentialsData,
  useCourseCredentials,
} from '@dae/wagmi'
import Papa from 'papaparse'
import { useFormFeedback } from '../../../hooks'
import { checkFileType } from '../../utils'

const validationSchema = Yup.object().shape({
  CSVFile: Yup.mixed()
    .required('CSV file is required.')
    .test(
      'fileType',
      'Please select a valid .csv file.',
      (file) => file && checkFileType(file as File, ['text/csv']),
    ),
})

type TransferCredentialsFormProps = {
  courseAddress: string
}

export const CredentialsBatchTransferForm: React.FC<
  TransferCredentialsFormProps
> = ({ courseAddress }) => {
  const { chain } = useNetwork()
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const { data } = useCourseCredentials(
    courseAddress as Address,
    chain?.id,
    'OTHER',
  )

  const {
    multiTransfer,
    isLoading,
    isError,
    isSuccess,
    error,
    isSigning,
    isValidating,
  } = useTransferCredentials(courseAddress as Address, 'OTHER')

  const [csvData, setCsvData] = useState<TransferCredentialsData[]>([])

  const { values, errors, touched, handleBlur, handleSubmit, setFieldValue } =
    useFormik({
      initialValues: {
        credentialIPFSCid: '',
        CSVFile: null,
      },
      onSubmit: async () => {
        try {
          if (data) {
            await multiTransfer(csvData, values.credentialIPFSCid)
            if (fileInputRef.current) {
              fileInputRef.current.value = ''
            }
            setFieldValue('credentialIPFSCid', '')
            setCsvData([])
          }
        } catch (_e) {}
      },
      validationSchema: validationSchema,
    })

  useFormFeedback({ isError, isSuccess, isLoading })

  const handleCSVFileChange = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0]

      if (!file) {
        return
      }

      const text = await file.text()

      Papa.parse<TransferCredentialsData>(text, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: true,
        complete: (results) => {
          setFieldValue('CSVFile', file)
          setCsvData(results.data)
        },
      })
    },
    [],
  )

  return (
    <form onSubmit={handleSubmit}>
      <Stack spacing={8}>
        <Stack spacing={4}>
          <FormControl
            isRequired
            isInvalid={!!errors.CSVFile && touched.CSVFile}
          >
            <FormLabel>File (.csv)</FormLabel>
            <Input
              id="CSVFile"
              onChange={handleCSVFileChange}
              onBlur={handleBlur}
              type="file"
              ref={fileInputRef}
              py={1}
            />
            <FormHelperText>
              Click{' '}
              <Link
                isExternal
                fontWeight={'bold'}
                href="/files/multi_transfer_credentials_example.csv"
              >
                here
              </Link>{' '}
              to download the example CSV file.
            </FormHelperText>
            <FormErrorMessage>{errors.CSVFile}</FormErrorMessage>
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
              value={values.credentialIPFSCid}
            >
              {data ? (
                data.credentials.map((credential) => {
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
        </Stack>
        {csvData.length > 0 && !errors.CSVFile ? (
          <Stack spacing={2}>
            <Text fontWeight={'semibold'}>Summary</Text>
            <TableContainer>
              <Table>
                <Thead>
                  <Tr>
                    <Th>Address</Th>
                    <Th>Email</Th>
                    <Th>Discord handle</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {csvData.map((row) => (
                    <Tr key={row.address}>
                      <Td>{row.address}</Td>
                      <Td>{row.email}</Td>
                      <Td>{row.discord}</Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </TableContainer>
          </Stack>
        ) : (
          <></>
        )}
        <Button
          colorScheme="blue"
          type="submit"
          isLoading={isLoading || isSigning || isValidating}
          loadingText="Submitting"
        >
          Transfer credentials
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
