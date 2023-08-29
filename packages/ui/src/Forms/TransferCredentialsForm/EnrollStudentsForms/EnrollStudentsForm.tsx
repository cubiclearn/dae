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
} from '@chakra-ui/react'
import { useFormik } from 'formik'
import React, { useEffect, useState } from 'react'
import { Address } from 'wagmi'
import * as Yup from 'yup'
import { useTransferCredentials, EnrollUserData } from '@dae/wagmi'
import { useRouter } from 'next/router'
import Papa from 'papaparse'

const validationSchema = Yup.object().shape({
  CSVFile: Yup.mixed().required('CSV file is required'),
})

type EnrollStudentsCSVFormProps = {
  courseAddress: string
}

export const EnrollStudentsForm: React.FC<EnrollStudentsCSVFormProps> = ({
  courseAddress,
}) => {
  const { multiTransfer, isLoading, isError, isSuccess, error, isSigning } =
    useTransferCredentials(courseAddress as Address, 'DISCIPULUS')
  const toast = useToast()
  const router = useRouter()

  const [csvData, setCsvData] = useState<EnrollUserData[]>([])

  const { errors, touched, handleBlur, handleSubmit, setFieldValue } =
    useFormik({
      initialValues: {
        CSVFile: null,
      },
      onSubmit: async () => {
        try {
          await multiTransfer(
            csvData,
            'https://dae-demo.infura-ipfs.io/ipfs/QmPfKCv7ZAz8294ShRTcHft5LSM9YaDJ4NTjZisCkhFxW8',
          )
          router.push(`/course/${courseAddress}/students/list`)
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
    Papa.parse<EnrollUserData>(text, {
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
        <FormControl isRequired isInvalid={!!errors.CSVFile && touched.CSVFile}>
          <FormLabel>File (.csv)</FormLabel>
          <Input
            id="CSVFile"
            onChange={handleCSVFileChange}
            onBlur={handleBlur}
            type="file"
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
        {csvData.length > 0 && (
          <Stack spacing={2}>
            <Text fontWeight={'semibold'}>Students List</Text>
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
          isLoading={isLoading || isSigning}
          loadingText="Submitting"
        >
          Enroll students
        </Button>
        {isError ? (
          <Alert status="error">
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
  )
}
