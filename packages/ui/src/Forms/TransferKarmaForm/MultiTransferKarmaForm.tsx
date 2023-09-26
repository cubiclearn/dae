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
import React, { useRef, useState } from 'react'
import { Address, useContractReads } from 'wagmi'
import * as Yup from 'yup'
import { TransferData, useTransferKarma } from '@dae/wagmi'
import Papa from 'papaparse'
import { useCourseData } from '../../CourseProvider'
import { KarmaAccessControlAbiUint64 } from '@dae/abi'
import { useLeavePageConfirmation } from '../../hooks'

const validationSchema = Yup.object().shape({
  CSVFile: Yup.mixed().required('CSV file is required'),
})

export const MultiTransferKarmaForm: React.FC<any> = () => {
  const { data } = useCourseData()
  const { multiTransfer, isLoading, isError, error, isSigning, isValidating } =
    useTransferKarma(
      data ? (data.karma_access_control_address as Address) : undefined,
    )
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const toast = useToast()

  useLeavePageConfirmation(isLoading, 'Changes you made may not be saved.')

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
      try {
        toast.promise(
          multiTransfer(csvData).then(() => {
            if (fileInputRef.current) {
              fileInputRef.current.value = ''
            }
            setCsvData([])
            resetForm()
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
      } catch (_e) {}
    },
    validationSchema: validationSchema,
  })

  const karmaAmountData = useContractReads({
    contracts: csvData.map((user) => {
      return {
        abi: KarmaAccessControlAbiUint64,
        address: data?.karma_access_control_address as Address | undefined,
        functionName: 'ratingOf',
        args: [user.address as Address],
      }
    }),
    enabled: csvData.length > 0,
    cacheOnBlock: true,
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
        <FormControl isRequired isInvalid={!!errors.CSVFile && touched.CSVFile}>
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
          <Stack spacing={2}>
            <Text fontWeight={'semibold'}>Summary</Text>
            <TableContainer>
              <Table>
                <Thead>
                  <Tr>
                    <Th>Address</Th>
                    <Th>Karma</Th>
                    <Th>Increment</Th>
                    <Th>Total</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {csvData.map((row, index) => (
                    <Tr key={row.address}>
                      <Td>{row.address}</Td>
                      <Td>
                        {karmaAmountData.data &&
                        karmaAmountData.data[index].status === 'success'
                          ? Number(karmaAmountData.data[index].result)
                          : '--'}
                      </Td>
                      <Td
                        color={
                          row.karma_increment > 0 ? 'green.500' : 'red.500'
                        }
                      >
                        {row.karma_increment > 0
                          ? `+${Number(row.karma_increment)}`
                          : `${Number(row.karma_increment)}`}
                      </Td>
                      <Td>
                        {karmaAmountData.data &&
                        karmaAmountData.data[index].status === 'success'
                          ? Number(karmaAmountData.data[index].result) +
                            row.karma_increment
                          : '--'}
                      </Td>
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
