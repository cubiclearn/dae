import {
  ChangeEvent,
  FC,
  FormEvent,
  useCallback,
  useEffect,
  useState,
} from 'react'
import { useRouter } from 'next/router'
import {
  Box,
  Stack,
  Heading,
  Text,
  FormControl,
  FormLabel,
  Button,
  Textarea,
} from '@chakra-ui/react'
import { useAirdropCredentials } from '@dae/hooks'
import { useToast } from '@chakra-ui/react'
import {
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from '@chakra-ui/react'

export const CredentialsAirDropForm: FC = () => {
  const { query } = useRouter()
  const courseAddress = query.address as `0x${string}`
  const toast = useToast()

  const [addresses, setAddresses] = useState<`0x${string}`[]>([])
  const [addressesListInput, setAddressesListInput] = useState<string>('')

  const [tokenURIs, setTokenURIs] = useState<string[]>([])
  const [tokenURIsInput, setTokenURIsInput] = useState('')

  const { enroll, isLoading, isSuccess, isSigning, isError, error } =
    useAirdropCredentials(courseAddress, addresses, tokenURIs)

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
    setAddressesListInput('')
    setTokenURIsInput('')
  }

  const formatAddresses = useCallback(
    (_addressListInput: string): `0x${string}`[] => {
      const cleanAddressesStringList = _addressListInput
        .replace(' ', '')
        .replace(/(\r\n|\n|\r)/gm, '')
      const addressesList = cleanAddressesStringList.split(',')
      return addressesList as `0x${string}`[]
    },
    [],
  )

  const formatTokenURIs = useCallback((_tokenURIsInput: string): string[] => {
    const cleanTokenURIsStringList = _tokenURIsInput
      .replace(' ', '')
      .replace(/(\r\n|\n|\r)/gm, '')
    const tokenURIsList = cleanTokenURIsStringList.split(',')
    return tokenURIsList
  }, [])

  const handleTokenURIChange = useCallback(
    (event: ChangeEvent<HTMLTextAreaElement>) => {
      const input = event.target.value
      setTokenURIsInput(input)
    },
    [],
  )

  const handleAddressesListChange = useCallback(
    (event: ChangeEvent<HTMLTextAreaElement>) => {
      const input = event.target.value
      setAddressesListInput(input)
    },
    [],
  )

  useEffect(() => {
    if (addressesListInput !== '') {
      setAddresses(formatAddresses(addressesListInput))
    }
  }, [addressesListInput, formatAddresses])

  useEffect(() => {
    if (tokenURIsInput !== '') {
      setTokenURIs(formatTokenURIs(tokenURIsInput))
    }
  }, [tokenURIsInput, formatTokenURIs])

  const handleAirdrop = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    try {
      await enroll()
      clearInputFields()
    } catch (_e) {}
  }

  return (
    <Box
      padding={8}
      borderRadius='xl'
      borderColor={'gray.300'}
      borderWidth={'1px'}
    >
      <form onSubmit={handleAirdrop}>
        <Stack spacing={4}>
          <Box>
            <Heading fontWeight='semibold' fontSize={'3xl'}>
              Enroll new students to this course
            </Heading>
            <Text fontSize={'lg'}>
              Please fill in all the fields of the form to enroll new students
              in this course and provide them with the credentials to access the
              lessons.
            </Text>
          </Box>
          <FormControl>
            <FormLabel>Token URIs list:</FormLabel>
            <Textarea
              onChange={handleTokenURIChange}
              value={tokenURIsInput}
              placeholder='uri1,uri2,...'
              required
            />
          </FormControl>
          <FormControl>
            <FormLabel>Destination addresses list:</FormLabel>
            <Textarea
              onChange={handleAddressesListChange}
              value={addressesListInput}
              placeholder='address1,address2,...'
              required
            />
          </FormControl>
          <Button
            colorScheme='blue'
            type='submit'
            disabled={isLoading || isSigning}
            isLoading={isLoading || isSigning}
            loadingText='Submitting'
          >
            Airdrop Credentials
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
        </Stack>
      </form>
    </Box>
  )
}
