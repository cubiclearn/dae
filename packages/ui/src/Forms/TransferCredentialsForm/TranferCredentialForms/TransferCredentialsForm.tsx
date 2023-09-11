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
import React, { ChangeEvent, useEffect, useRef, useState } from 'react'
import { Address, useNetwork } from 'wagmi'
import * as Yup from 'yup'
import {
  useTransferCredentials,
  TransferCredentialsData,
  useCourseCredentials,
} from '@dae/wagmi'
import Papa from 'papaparse'
import { CredentialType } from '@dae/database'

const validationSchema = Yup.object().shape({
  CSVFile: Yup.mixed().required('CSV file is required'),
})

type TransferCredentialsFormProps = {
  courseAddress: string
  credentialType: CredentialType
}

export const TransferCredentialsForm: React.FC<TransferCredentialsFormProps> =
  ({ courseAddress, credentialType }) => {
    const { chain } = useNetwork()
    const fileInputRef = useRef<HTMLInputElement | null>(null)
    const { data } = useCourseCredentials(
      courseAddress as Address,
      chain?.id,
      credentialType,
    )

    const {
      multiTransfer,
      isLoading,
      isError,
      isSuccess,
      error,
      isSigning,
      isValidating,
    } = useTransferCredentials(courseAddress as Address, credentialType)
    const toast = useToast()

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
              const credentialCID =
                credentialType === 'DISCIPULUS' || credentialType === 'MAGISTER'
                  ? data[0].ipfs_cid
                  : values.credentialIPFSCid
              await multiTransfer(csvData, credentialCID)
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

    const handleCSVFileChange = async (
      e: React.ChangeEvent<HTMLInputElement>,
    ) => {
      const file = e.target.files?.[0]

      if (!file) {
        return
      }

      const text = await file.text()

      // Use PapaParse for CSV parsing
      Papa.parse<TransferCredentialsData>(text, {
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
            {credentialType === 'OTHER' ? (
              <FormControl
                isRequired
                isInvalid={
                  !!errors.credentialIPFSCid && touched.credentialIPFSCid
                }
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
          </Stack>
          {csvData.length > 0 && (
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
          )}
          <Button
            colorScheme="blue"
            type="submit"
            isLoading={isLoading || isSigning || isValidating}
            loadingText="Submitting"
          >
            {credentialType === 'DISCIPULUS' && 'Enroll students'}
            {credentialType === 'OTHER' && 'Transfer credentials'}
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
