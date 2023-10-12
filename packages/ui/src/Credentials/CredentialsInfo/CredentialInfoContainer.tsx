import {
  Stack,
  Box,
  Center,
  Spinner,
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Button,
  Link,
} from '@chakra-ui/react'
import React from 'react'
import { CredentialInfo } from './CredentialInfo'
import { useCourseCredential } from '@dae/wagmi'
import { ArrowBackIcon } from '@chakra-ui/icons'
import NextLink from 'next/link'
import { Address } from 'viem'
import { SyncButton } from '../../SyncButton'
import { CustomCredentialsRowList } from '../../UserRow'

type CredentialInfoContainerProps = {
  credentialCid: string | undefined
  courseAddress: Address
}

export const CredentialInfoContainer: React.FC<CredentialInfoContainerProps> =
  ({ credentialCid, courseAddress }) => {
    const {
      data: credentialData,
      isLoading: isLoadingCredentialData,
      error: credentialDataError,
    } = useCourseCredential({ courseAddress, credentialCid })

    if (isLoadingCredentialData) {
      return (
        <Center>
          <Spinner />
        </Center>
      )
    }

    if (credentialDataError) {
      return (
        <Alert status="error">
          <AlertIcon />
          <Box>
            <AlertTitle>Something went wrong.</AlertTitle>
            <AlertDescription>
              There is an error fetching your data. Try again later.
            </AlertDescription>
          </Box>
        </Alert>
      )
    }

    if (!credentialData) {
      return (
        <Alert status="info">
          <AlertIcon />
          <Box>
            <AlertTitle>Nothing to show.</AlertTitle>
            <AlertDescription>There is no credential to show.</AlertDescription>
          </Box>
        </Alert>
      )
    }

    return (
      <Stack spacing={{ base: 8, lg: 4 }}>
        <Stack justifyContent={'space-between'} direction={'row'}>
          <Stack
            justifyContent={'space-between'}
            direction={'row'}
            width={'full'}
          >
            <Link
              as={NextLink}
              href={`/course/${courseAddress}/credentials/list`}
            >
              <Button leftIcon={<ArrowBackIcon />}>Back</Button>
            </Link>
            <SyncButton />
          </Stack>
        </Stack>
        <Stack direction={{ base: 'column', lg: 'row' }} spacing={8}>
          <Box width={{ base: 'none', lg: '30%', xl: '20%' }}>
            <CredentialInfo credentialData={credentialData.credential} />
          </Box>
          <Box width={{ base: 'none', lg: '70%', xl: '80%' }}>
            <CustomCredentialsRowList
              courseAddress={courseAddress}
              credentialCid={credentialCid}
            />
          </Box>
        </Stack>
      </Stack>
    )
  }
