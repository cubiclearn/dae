import React from 'react'
import {
  Stack,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  Text,
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Box,
} from '@chakra-ui/react'
import { UserCredentials } from '@dae/database'

interface CredentialUsersProps {
  credentialUsersData: UserCredentials[]
}

export const CredentialUsers: React.FC<CredentialUsersProps> = ({
  credentialUsersData,
}) => {
  return (
    <Stack
      spacing={4}
      borderRadius={'lg'}
      p={4}
      background={'white'}
      boxShadow={'md'}
    >
      <Text fontWeight={'semibold'} fontSize={'2xl'}>
        Credential owners
      </Text>
      {credentialUsersData.length > 0 ? (
        <TableContainer>
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>{}</Th>
                <Th>Address</Th>
              </Tr>
            </Thead>
            <Tbody>
              {credentialUsersData.map((user, index) => {
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
      ) : (
        <Alert status="info">
          <AlertIcon />
          <Box>
            <AlertTitle>Nothing to show.</AlertTitle>
            <AlertDescription>
              There is no user who owns this credential.
            </AlertDescription>
          </Box>
        </Alert>
      )}
    </Stack>
  )
}
