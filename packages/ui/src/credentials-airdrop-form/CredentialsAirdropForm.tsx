import {ChangeEvent, FC, FormEvent, useCallback, useEffect, useState} from 'react'
import {CredentialsAbi} from '@dae/abi'
import {useContractWrite, usePrepareContractWrite} from 'wagmi'
import {ethers} from 'ethers'
import {toast} from 'react-toastify'
import {useRouter} from 'next/router'
import {useNetwork} from 'wagmi'
import {
  Box,
  Stack,
  Heading,
  Text,
  FormControl,
  FormLabel,
  FormHelperText,
  FormErrorMessage,
  Button,
  Textarea,
} from '@chakra-ui/react'

export const CredentialsAirDropForm: FC = () => {
  const {query} = useRouter()
  const courseAddress = query.address as `0x${string}`
  const {chain} = useNetwork()

  const [addresses, setAddresses] = useState<`0x${string}`[]>([])
  const [addressesListInput, setAddressesListInput] = useState<string>('')

  const [tokenURIs, setTokenURIs] = useState<string[]>([])
  const [tokenURIsInput, setTokenURIsInput] = useState('')

  const [isAddressListCorrect, setIsAddressListCorrect] = useState(true)
  const [isTokenURIsListCorrect, setIsTokenURIsListCorrect] = useState(true)

  const {config} = usePrepareContractWrite({
    abi: CredentialsAbi,
    address: courseAddress,
    functionName: 'multiMint',
    args: [addresses, tokenURIs],
    enabled: addresses.length > 0 && tokenURIs.length > 0 && isAddressListCorrect && isTokenURIsListCorrect,
  })

  const {writeAsync} = useContractWrite(config)

  const formatAddresses = useCallback((_addressListInput: string): `0x${string}`[] => {
    const cleanAddressesStringList = _addressListInput.replace(' ', '').replace(/(\r\n|\n|\r)/gm, '')
    const addressesList = cleanAddressesStringList.split(',')
    return addressesList as `0x${string}`[]
  }, [])

  const formatTokenURIs = useCallback((_tokenURIsInput: string): string[] => {
    const cleanTokenURIsStringList = _tokenURIsInput.replace(' ', '').replace(/(\r\n|\n|\r)/gm, '')
    const tokenURIsList = cleanTokenURIsStringList.split(',')
    return tokenURIsList
  }, [])

  const checkAddressesListIsCorrect = useCallback(
    (_addressListInput: string) => {
      const addressesList = formatAddresses(_addressListInput)
      for (let i = 0; i < addressesList.length; i++) {
        if (!ethers.utils.isAddress(addressesList[i])) {
          setIsAddressListCorrect(false)
          return
        }
      }
      setIsAddressListCorrect(true)
    },
    [formatAddresses]
  )

  const checkTokenURIsListIsCorrect = useCallback(
    (_tokenURIsInput: string) => {
      const tokenURIsList = formatTokenURIs(_tokenURIsInput)
      for (let i = 0; i < tokenURIsList.length; i++) {
        if (tokenURIsList[i] == '') {
          setIsTokenURIsListCorrect(false)
          return
        }
      }
      setIsTokenURIsListCorrect(true)
    },
    [formatTokenURIs]
  )

  const handleTokenURIChange = useCallback((event: ChangeEvent<HTMLTextAreaElement>) => {
    const input = event.target.value
    setTokenURIsInput(input)
  }, [])

  const handleAddressesListChange = useCallback((event: ChangeEvent<HTMLTextAreaElement>) => {
    const input = event.target.value
    setAddressesListInput(input)
  }, [])

  useEffect(() => {
    if (addressesListInput != '') {
      setAddresses(formatAddresses(addressesListInput))
      checkAddressesListIsCorrect(addressesListInput)
    }
  }, [addressesListInput, checkAddressesListIsCorrect, formatAddresses])

  useEffect(() => {
    if (tokenURIsInput !== '') {
      setTokenURIs(formatTokenURIs(tokenURIsInput))
      checkTokenURIsListIsCorrect(tokenURIsInput)
    }
  }, [tokenURIsInput, checkTokenURIsListIsCorrect, formatTokenURIs])

  const handleAirdrop = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (
      addresses.length > 0 &&
      tokenURIs.length == addresses.length &&
      isAddressListCorrect &&
      isTokenURIsListCorrect
    ) {
      try {
        const promise = writeAsync!()

        await toast.promise(promise, {
          pending: 'Transaction in progress...',
          success: 'Transaction complete!',
          error: 'Error',
        })

        await fetch(`/api/v0/course/students`, {
          method: 'POST',
          body: JSON.stringify({
            addressesToEnroll: addresses,
            courseAddress: courseAddress,
            chainId: chain?.id,
          }),
          headers: {
            'Content-type': 'application/json; charset=UTF-8',
          },
        })
        setAddressesListInput('')
        setTokenURIsInput('')
      } catch (error) {
        console.error(error)
      }
    }
  }

  return (
    <Box padding={8} borderRadius="xl" borderColor={'gray.300'} borderWidth={'1px'}>
      <form onSubmit={handleAirdrop}>
        <Stack spacing={4}>
          <Box>
            <Heading fontWeight="semibold" fontSize={'3xl'}>
              Create new course
            </Heading>
            <Text fontSize={'lg'}>Fill in all the form fields to create a new course and start teaching!</Text>
          </Box>
          <FormControl>
            <FormLabel>Token URIs list:</FormLabel>
            <Textarea
              onChange={handleTokenURIChange}
              value={tokenURIsInput}
              placeholder="uri1,uri2,..."
              required
            ></Textarea>
            {isTokenURIsListCorrect ? (
              <FormHelperText>TokenURIs list is correct!</FormHelperText>
            ) : (
              <FormErrorMessage>TokenURIs list is incorrect!</FormErrorMessage>
            )}
          </FormControl>
          <FormControl>
            <FormLabel>Destination addresses list:</FormLabel>
            <Textarea
              onChange={handleAddressesListChange}
              value={addressesListInput}
              placeholder="address1,address2,..."
              required
            ></Textarea>
            {isAddressListCorrect ? (
              <FormHelperText>Addresses list is correct!</FormHelperText>
            ) : (
              <FormErrorMessage>Addresses list is incorrect!</FormErrorMessage>
            )}
          </FormControl>
          <Button type="submit">Start Credentials Airdrop</Button>
        </Stack>
      </form>
    </Box>
  )
}
