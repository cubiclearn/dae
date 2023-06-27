import {
  Box,
  Stack,
  Heading,
  FormControl,
  FormLabel,
  Select,
  Input,
  Button,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Text,
  useToast,
} from '@chakra-ui/react'
import { useCreateCourse } from '@dae/wagmi'
import { useState, useEffect, useCallback, ChangeEvent, FormEvent } from 'react'

export const CreateCourseForm = () => {
  const [symbol, setSymbol] = useState<string>('')
  const [name, setName] = useState<string>('')
  const [bUri, setBUri] = useState<string>('')
  const [maxSupply, setMaxSupply] = useState<bigint>(BigInt(0))
  const [isBurnable, setIsBurnable] = useState(false)
  const toast = useToast()

  const { create, isLoading, isError, isSuccess, isSigning, error } =
    useCreateCourse(isBurnable, name, symbol, bUri, maxSupply)

  useEffect(() => {
    if (isError) {
      toast({
        title: 'Error creating course.',
        status: 'error',
      })
    }
    if (isSuccess) {
      toast({
        title: 'Course created with success!',
        status: 'success',
      })
    }
    if (isLoading) {
      toast({
        title: 'Creating course...',
        status: 'info',
      })
    }
  }, [isLoading, isError, isSuccess])

  const clearInputFields = () => {
    setName('')
    setSymbol('')
    setBUri('')
    setMaxSupply(BigInt(0))
  }

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

    try {
      await create()
      clearInputFields()
    } catch (_e: any) {}
  }

  return (
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
            <Input onChange={handleSymbolChange} value={symbol} type='text' />
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
          <Button
            colorScheme='blue'
            type='submit'
            disabled={isLoading || isSigning}
            isLoading={isLoading || isSigning}
            loadingText='Submitting'
          >
            Create course
          </Button>
        </Stack>
      </form>
      {isError ? (
        <Alert status='error'>
          <AlertIcon />
          <Box>
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Box>
        </Alert>
      ) : (
        <></>
      )}
    </Box>
  )
}
