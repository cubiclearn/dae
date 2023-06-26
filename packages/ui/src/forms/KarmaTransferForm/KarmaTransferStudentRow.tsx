import { ChangeEvent, useCallback, useEffect, useState } from 'react'
import {
  FormControl,
  Input,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberDecrementStepper,
  NumberIncrementStepper,
  FormLabel,
  Flex,
  Button,
  VStack,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Box,
} from '@chakra-ui/react'
import { KarmaCounter } from './KarmaCounter'
import { Address, isAddress } from 'viem'
import { useTransferKarma } from '@dae/hooks'
import { useToast } from '@chakra-ui/react'

type KarmaTransferStudentRowProps = {
  karmaAccessControlAddress: Address
}

export const KarmaTransferStudentRow = ({
  karmaAccessControlAddress,
}: KarmaTransferStudentRowProps) => {
  const [studentKarma, setStudentKarma] = useState<number | undefined>(
    undefined,
  )
  const [studentAddress, setStudentAddress] = useState<string>('')
  const [studentKarmaIncrementAmount, setStudentKarmaIncrementAmount] =
    useState(0)
  const toast = useToast()

  const { transferKarma, isError, isLoading, isSigning, isSuccess, error } =
    useTransferKarma(
      karmaAccessControlAddress,
      studentAddress ? (studentAddress as Address) : undefined,
      studentKarma
        ? BigInt(studentKarma + studentKarmaIncrementAmount)
        : undefined,
    )

  useEffect(() => {
    if (isError) {
      toast({
        title: 'Error transferring karma to this address.',
        status: 'error',
      })
    }
    if (isSuccess) {
      toast({
        title: 'Karma transferred with success!',
        status: 'success',
      })
    }
    if (isLoading) {
      toast({
        title: 'Transfering karma...',
        status: 'info',
      })
    }
  }, [isLoading, isError, isSuccess])

  const handleStudentAddressChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const input = event.target.value
      setStudentAddress(input)
    },
    [],
  )

  const handleStudentKarmaChange = (karma: number) => {
    setStudentKarma(karma)
  }

  const handleKarmaTransferAmountChange = (
    _valueAsString: string,
    valueAsNumber: number,
  ) => {
    if (_valueAsString === '') {
      setStudentKarmaIncrementAmount(0) // Set a default value when the input is empty
    } else {
      setStudentKarmaIncrementAmount(valueAsNumber)
    }
  }

  const handleKarmaTransfer = async () => {
    try {
      await transferKarma()
    } catch (_e) {}
  }

  useEffect(() => {
    if (isAddress(studentAddress) && studentKarma) {
    }
  }, [studentKarma, studentKarmaIncrementAmount])

  return (
    <VStack
      padding={4}
      borderWidth={'1px'}
      borderColor={'gray.300'}
      borderRadius={'md'}
      width={'100%'}
    >
      <Flex
        alignItems={'center'}
        marginTop={'10px'}
        marginBottom={'10px'}
        flexDirection={'row'}
        gap={4}
        justifyContent={'space-between'}
        alignContent={'flex-end'}
        width={'100%'}
      >
        <FormControl width={'75%'}>
          <FormLabel>Student address</FormLabel>
          <Input
            type='text'
            placeholder='0x0000000000000000000000000000000000000000'
            value={studentAddress}
            onChange={handleStudentAddressChange}
          />
        </FormControl>
        <FormControl width={'15%'}>
          <FormLabel>Incr./Decr.</FormLabel>
          <NumberInput
            size='md'
            maxW={24}
            defaultValue={studentKarmaIncrementAmount}
            min={-20}
            max={20}
            onChange={handleKarmaTransferAmountChange}
          >
            <NumberInputField />
            <NumberInputStepper>
              <NumberIncrementStepper />
              <NumberDecrementStepper />
            </NumberInputStepper>
          </NumberInput>
        </FormControl>
        <KarmaCounter
          onStudentKarmaChange={handleStudentKarmaChange}
          karmaAccessControlAddress={karmaAccessControlAddress}
          studentAddress={studentAddress}
        />
      </Flex>
      <Button
        colorScheme='blue'
        disabled={isLoading || isSigning}
        isLoading={isLoading || isSigning}
        loadingText='Submitting'
        onClick={handleKarmaTransfer}
      >
        Transfer Karma
      </Button>
      {isError ? (
        <Alert status='error'>
          <AlertIcon />
          <Box>
            <AlertTitle>Error.</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Box>
        </Alert>
      ) : (
        <></>
      )}
    </VStack>
  )
}
