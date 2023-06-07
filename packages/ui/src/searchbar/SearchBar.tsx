import {FC, useState, ChangeEvent} from 'react'
import {Input, InputGroup, InputLeftElement} from '@chakra-ui/react'
import {Search2Icon} from '@chakra-ui/icons'
import {useRouter} from 'next/router'
import {isAddress} from 'ethers/lib/utils.js'

export const SearchBar: FC = () => {
  const router = useRouter()
  const [isInvalid, setIsInvalid] = useState(false)
  const [searchAddress, setSearchAddress] = useState('')

  const handleSearchTextChange = (event: ChangeEvent<HTMLInputElement>) => {
    const input = event.target.value
    setSearchAddress(input)
  }

  const submitSearch = () => {
    if (isAddress(searchAddress)) {
      router.push(`/course/${searchAddress}`)
    } else {
      setIsInvalid(true)
    }
  }

  return (
    <InputGroup size="md" mx={8}>
      <InputLeftElement pointerEvents="none">
        <Search2Icon color="gray.300" />
      </InputLeftElement>
      <Input
        isInvalid={isInvalid}
        onChange={handleSearchTextChange}
        type="text"
        placeholder="Write course address here..."
        value={searchAddress}
        onKeyDown={submitSearch}
      />
    </InputGroup>
  )
}
