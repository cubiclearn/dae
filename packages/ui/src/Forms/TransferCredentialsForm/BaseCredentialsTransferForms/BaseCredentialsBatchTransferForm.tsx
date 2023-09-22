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
} from '@chakra-ui/react'
import { useFormik } from 'formik'
import React, { useCallback, useRef, useState } from 'react'
import { Address, useNetwork } from 'wagmi'
import * as Yup from 'yup'
import {
  useTransferCredentials,
  TransferCredentialsData,
  useCourseCredentials,
} from '@dae/wagmi'
import Papa from 'papaparse'
import { checkFileType } from '../../utils'
import { useToast } from '@chakra-ui/react'
import { useLeavePageConfirmation } from '../../../hooks'

const validationSchema = Yup.object().shape({
  CSVFile: Yup.mixed()
    .required('CSV file is required')
    .test(
      'fileType',
      'Please select a valid .csv file.',
      (file) => file && checkFileType(file as File, ['text/csv']),
    ),
})

type TransferCredentialsFormProps = {
  courseAddress: string
  credentialType: 'MAGISTER' | 'DISCIPULUS'
}

export const BaseCredentialsBatchTransfer: React.FC<
  TransferCredentialsFormProps
> = ({ courseAddress, credentialType }) => {
  const { chain } = useNetwork()
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const { data } = useCourseCredentials(
    courseAddress as Address,
    chain?.id,
    credentialType,
  )
  const toast = useToast()

  const { multiTransfer, isLoading, isError, error, isSigning, isValidating } =
    useTransferCredentials(courseAddress as Address, credentialType)

  useLeavePageConfirmation(isLoading, 'Changes you made may not be saved.')

  const [csvData, setCsvData] = useState<TransferCredentialsData[]>([])

  const { errors, touched, handleBlur, handleSubmit, setFieldValue } =
    useFormik({
      initialValues: {
        credentialIPFSCid: '',
        CSVFile: null,
      },
      onSubmit: async () => {
        try {
          if (!data) return
          toast.promise(multiTransfer(csvData, data.credentials[0].ipfs_cid), {
            success: {
              title: 'Credentials transferred with success!',
            },
            error: { title: 'Error transferring credentials.' },
            loading: {
              title: 'Credentials transfer in progress...',
              description:
                'Processing transaction on the blockchain can take some time (usually around one minute).',
              onCloseComplete: () => {
                if (fileInputRef.current) {
                  fileInputRef.current.value = ''
                }
                setFieldValue('credentialIPFSCid', '')
                setCsvData([])
              },
            },
          })
        } catch (_e) {}
      },
      validationSchema: validationSchema,
    })

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
                href="/files/enroll_students_example.csv"
              >
                here
              </Link>{' '}
              to download the example CSV file.
            </FormHelperText>
            <FormErrorMessage>{errors.CSVFile}</FormErrorMessage>
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
