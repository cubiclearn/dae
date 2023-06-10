import { useState, ChangeEvent, useCallback, FormEvent, useEffect } from 'react'
import Head from 'next/head'
import { CredentialsFactoryAbi } from '@dae/abi'
import {
  usePrepareContractWrite,
  useContractWrite,
  useWaitForTransaction,
} from 'wagmi'
import { useNetwork } from 'wagmi'
import { toast } from 'react-toastify'
import { Layout } from '@dae/ui'
import {
  FormControl,
  FormLabel,
  Text,
  Stack,
  Input,
  Button,
  Tabs,
  TabList,
  Tab,
  Link,
  Heading,
  Box,
  Select,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from '@chakra-ui/react'
import NextLink from 'next/link'

export default function AddCoursePage() {
  const { chain, chains } = useNetwork()
  const [symbol, setSymbol] = useState<string>('')
  const [name, setName] = useState<string>('')
  const [bUri, setBUri] = useState<string>('')
  const [maxSupply, setMaxSupply] = useState<bigint>(BigInt(0))
  const [isBurnable, setIsBurnable] = useState(false)

  const { config } = usePrepareContractWrite({
    address: process.env.NEXT_PUBLIC_FACTORY_CONTRACT_ADDRESS as '0x${string}',
    functionName: 'createCourse',
    args: [isBurnable, name, symbol, bUri, maxSupply],
    abi: CredentialsFactoryAbi,
  })

  const contractWrite = useContractWrite(config)
  const waitForTransaction = useWaitForTransaction({
    hash: contractWrite.data?.hash,
  })

  useEffect(() => {
    async function fetchData() {
      try {
        await createCourse()
        clearInputFields()
      } catch (e) {
        console.log(e)
      }
    }
    if (waitForTransaction.data !== undefined) {
      fetchData()
    }
  }, [waitForTransaction.data])

  const clearInputFields = () => {
    setName('')
    setSymbol('')
    setBUri('')
    setMaxSupply(BigInt(0))
  }

  const areInputsValid = () => {
    if (
      name !== '' &&
      symbol !== '' &&
      bUri !== '' &&
      maxSupply !== null &&
      maxSupply > 0
    ) {
      return true
    } else {
      return false
    }
  }

  const createCourse = useCallback(async () => {
    await fetch('/api/v0/course', {
      method: 'POST',
      body: JSON.stringify({
        txHash: waitForTransaction.data?.transactionHash,
        chainId: chain?.id,
      }),
      headers: {
        'Content-type': 'application/json; charset=UTF-8',
      },
    })
  }, [waitForTransaction.data, chain])

  const handleCredentialsTypeChange = useCallback(
    (event: ChangeEvent<HTMLSelectElement>) => {
      const targetValue = event.target.value
      if (targetValue === 'not-burnable') {
        setIsBurnable(false)
      } else {
        setIsBurnable(true)
      }
    },
    [],
  )

  const handleSymbolChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const input = event.target.value
      setSymbol(input)
    },
    [],
  )

  const handleNameChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const input = event.target.value
      setName(input)
    },
    [],
  )

  const handleBUriChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const input = event.target.value
      setBUri(input)
    },
    [],
  )

  const handleMaxSupplyChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const input = event.target.value
      if (input === '') {
        setMaxSupply(BigInt(0))
        return
      }

      const isNumber = /^\d+$/.test(input)
      if (isNumber) {
        setMaxSupply(BigInt(input))
      }
    },
    [],
  )

  const handleCreateCourse = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const validInputs = areInputsValid()
    if (validInputs) {
      try {
        const promise = contractWrite.writeAsync!()

        await toast.promise(promise, {
          pending: 'Transaction in progress...',
          success: 'Transaction complete!',
          error: 'Error',
        })
      } catch (error) {
        console.error(error)
      }
    }
  }

  return (
    <>
      <Head>
        <title>New Course</title>
        <meta name='description' content='Generated by create next app' />
        <meta name='viewport' content='width=device-width, initial-scale=1' />
        <link rel='icon' href='/favicon.ico' />
      </Head>
      <Layout.Profile heading='New Course'>
        <Stack spacing={8}>
          <Tabs defaultIndex={2}>
            <TabList>
              <Tab
                as={NextLink}
                href={`/profile/courses/teaching?chainId=${
                  chain ? chain.id : chains[0].id
                }`}
                style={{ textDecoration: 'none' }}
              >
                Teaching
              </Tab>
              <Link
                as={NextLink}
                href={`/profile/courses/partecipating?chainId=${
                  chain ? chain.id : chains[0].id
                }`}
                style={{ textDecoration: 'none' }}
              >
                <Tab>Partecipating</Tab>
              </Link>
              <Tab>Create</Tab>
            </TabList>
          </Tabs>

          <Box
            padding={8}
            borderRadius='xl'
            borderColor={'gray.300'}
            borderWidth={'1px'}
          >
            <form onSubmit={handleCreateCourse}>
              <Stack spacing={4}>
                <Box>
                  <Heading fontWeight='semibold' fontSize={'3xl'}>
                    Create new course
                  </Heading>
                  <Text fontSize={'lg'}>
                    Fill in all the form fields to create a new course and start
                    teaching!
                  </Text>
                </Box>
                <FormControl>
                  <FormLabel>
                    Select the type of credential this course implements
                  </FormLabel>
                  <Select onChange={handleCredentialsTypeChange}>
                    <option value='not-burnable'>Not Burnable</option>
                    <option value='burnable'>Burnable</option>
                  </Select>
                </FormControl>
                <FormControl>
                  <FormLabel>Course Name:</FormLabel>
                  <Input onChange={handleNameChange} value={name} type='text' />
                </FormControl>
                <FormControl>
                  <FormLabel>Symbol:</FormLabel>
                  <Input
                    onChange={handleSymbolChange}
                    value={symbol}
                    type='text'
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Max partecipants:</FormLabel>
                  <Input
                    onChange={handleMaxSupplyChange}
                    value={Number(maxSupply) !== 0 ? maxSupply.toString() : ''}
                    autoComplete='off'
                    autoCorrect='off'
                    type='text'
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Metadata URL:</FormLabel>
                  <Input
                    onChange={handleBUriChange}
                    value={bUri}
                    type='bUri'
                    autoComplete='off'
                    placeholder=''
                  />
                </FormControl>
                {waitForTransaction.isError ? (
                  <Alert status='error'>
                    <AlertIcon />
                    <AlertTitle>Error!</AlertTitle>
                    <AlertDescription>
                      {waitForTransaction.error?.message}
                    </AlertDescription>
                  </Alert>
                ) : (
                  <></>
                )}
                <Button
                  colorScheme='blue'
                  type='submit'
                  disabled={
                    waitForTransaction.isLoading || contractWrite.isLoading
                  }
                  isLoading={
                    waitForTransaction.isLoading || contractWrite.isLoading
                  }
                  loadingText='Submitting'
                >
                  Create course
                </Button>
              </Stack>
            </form>
          </Box>
        </Stack>
      </Layout.Profile>
    </>
  )
}
