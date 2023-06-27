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
import { Address, isAddress } from 'viem'

export const CredentialsAirDropForm: FC = () => {
  const { query } = useRouter()
  const courseAddress = query.address as Address
  const toast = useToast()

  const [addresses, setAddresses] = useState<Address[]>([])
  const [addressesListInput, setAddressesListInput] = useState<string>('')

  const [tokenURIs, setTokenURIs] = useState<string[]>([])
  const [tokenURIsInput, setTokenURIsInput] = useState<string>('')

  const { enroll, isLoading, isSuccess, isSigning, isError, error } =
    useAirdropCredentials(courseAddress, addresses, tokenURIs)

  useEffect(() => {
    if (isError) {
      toast({
        title: 'Error transferring credentials.',
        status: 'error',
      })
    }
    if (isSuccess) {
      toast({
        title: 'Credentials transferrred with success!',
        status: 'success',
      })
    }
    if (isLoading) {
      toast({
        title: 'Transferring credentials...',
        status: 'info',
      })
    }
  }, [isLoading, isError, isSuccess])

  const clearInputFields = () => {
    setAddressesListInput('')
    setTokenURIsInput('')
  }

  const isValidURL = (url: string) => {
    const urlPattern = /^((https?|ftp):\/\/)?[^\s/$.?#].[^\s]*$/i
    return urlPattern.test(url)
  }

  const handleTokenURIChange = useCallback(
    (event: ChangeEvent<HTMLTextAreaElement>) => {
      setTokenURIsInput(event.target.value)
    },
    [],
  )

  const handleAddressesListChange = useCallback(
    (event: ChangeEvent<HTMLTextAreaElement>) => {
      setAddressesListInput(event.target.value)
    },
    [],
  )

  useEffect(() => {
    const cleanTokenURIsStringList = tokenURIsInput
      .replace(' ', '')
      .replace(/(\r\n|\n|\r)/gm, '')
    const urlList = cleanTokenURIsStringList.split(',').map((url) => url.trim())
    const validURLs = urlList.filter((url) => isValidURL(url))
    setTokenURIs(validURLs)
  }, [tokenURIsInput])

  useEffect(() => {
    const cleanAddressListString = addressesListInput
      .replace(' ', '')
      .replace(/(\r\n|\n|\r)/gm, '')
    const addressesList = cleanAddressListString
      .split(',')
      .map((address) => address.trim())
    const validAddresses = addressesList.filter((address) => isAddress(address))
    setAddresses(validAddresses as Address[])
  }, [addressesListInput])

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
            <FormLabel>Token URIs list (comma separated):</FormLabel>
            <Textarea
              onChange={handleTokenURIChange}
              value={tokenURIsInput}
              placeholder='www.yoursite.com, www.yoursite2.com,...'
              required
            />
          </FormControl>
          <FormControl>
            <FormLabel>
              New students addresses list (comma separated):
            </FormLabel>
            <Textarea
              onChange={handleAddressesListChange}
              value={addressesListInput}
              placeholder='address1, address2,...'
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
