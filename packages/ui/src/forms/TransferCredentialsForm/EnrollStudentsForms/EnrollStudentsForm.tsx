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
} from '@chakra-ui/react'
import { useFormik } from 'formik'
import React, { useEffect, useState } from 'react'
import { Address } from 'wagmi'
import * as Yup from 'yup'
import { useTransferCredentials, EnrollUserData } from '@dae/wagmi'
import { useRouter } from 'next/router'

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
          console.log('CIAO')
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

  const handleCSVFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]

    if (!file) {
      return
    }
    const reader = new FileReader()

    reader.onload = async (event) => {
      if (event.target) {
        const contentArrayBuffer = event.target.result
        if (contentArrayBuffer instanceof ArrayBuffer) {
          const textDecoder = new TextDecoder()
          const content = textDecoder.decode(contentArrayBuffer)

          const rows = content.split('\n')
          const parsedData = rows
            .filter((row) => row.split(',').length === 3)
            .map((row) => {
              const columns = row.split(',')
              return {
                address: columns[0].trim(),
                email: columns[1].trim(),
                discord: columns[2].trim(),
              } as EnrollUserData
            })
          setFieldValue('CSVFile', file)
          setCsvData(parsedData)
        }
      }
    }

    reader.readAsArrayBuffer(file)
  }

  return (
    <form onSubmit={handleSubmit}>
      <Stack spacing={6}>
        <FormControl isRequired isInvalid={!!errors.CSVFile && touched.CSVFile}>
          <FormLabel>CSV File</FormLabel>
          <Input
            id="CSVFile"
            onChange={handleCSVFileChange}
            onBlur={handleBlur}
            type="file"
            py={1}
          />
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
