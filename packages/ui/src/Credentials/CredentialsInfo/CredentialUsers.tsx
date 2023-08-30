import React from 'react'
import {
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Box,
  Center,
  Spinner,
  Stack,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  Text,
} from '@chakra-ui/react'
import { useCourseCredentialUsers } from '@dae/wagmi'

interface CredentialUsersProps {
  credentialId: number | undefined
}

export const CredentialUsers: React.FC<CredentialUsersProps> = ({
  credentialId,
}) => {
  const { data, error, isLoading } = useCourseCredentialUsers(credentialId)

  if (isLoading) {
    return (
      <Center>
        <Spinner />
      </Center>
    )
  }

  if (error) {
    return (
      <Alert status="error">
        <AlertIcon />
        <Box>
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            There is an error fetching your data. Try again later.
          </AlertDescription>
        </Box>
      </Alert>
    )
  }

  if (!data || data.length === 0) {
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
    <Stack
      spacing={4}
      borderRadius={'lg'}
      px={8}
      py={4}
      background={'white'}
      boxShadow={'md'}
    >
      <Text fontWeight={'semibold'} fontSize={'2xl'}>
        Credential owners
      </Text>
      <TableContainer>
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>{}</Th>
              <Th>Address</Th>
            </Tr>
          </Thead>
          <Tbody>
            {data.map((user, index) => {
              return (
                <Tr key={index}>
                  <Td>#{index + 1}</Td>
                  <Td>{user.user_address}</Td>
                </Tr>
              )
            })}
          </Tbody>
        </Table>
      </TableContainer>
    </Stack>
  )
}
