import {
  Stack,
  Table,
  TableContainer,
  Tbody,
  Th,
  Thead,
  Tr,
  Text,
} from '@chakra-ui/react'
import React from 'react'
import { Address } from 'viem'
import { KarmaTransferSummaryTableRow } from './KarmaTransferSummaryTableRow'

type KarmaTransferSummmaryTableProps = {
  usersKarmaIncrementData: {
    userAddress: Address
    karmaIncrement: number
  }[]
}

export const KarmaTransferSummaryTable: React.FC<
  KarmaTransferSummmaryTableProps
> = ({ usersKarmaIncrementData }) => {
  return (
    <Stack>
      <Text fontWeight={'semibold'}>Summary</Text>
      <TableContainer>
        <Table>
          <Thead>
            <Tr>
              <Th>Address</Th>
              <Th>Karma</Th>
              <Th>Increment</Th>
              <Th>Total</Th>
            </Tr>
          </Thead>
          <Tbody>
            {usersKarmaIncrementData.map((userKarmaIncrementData) => {
              return (
                <KarmaTransferSummaryTableRow
                  key={userKarmaIncrementData.userAddress}
                  userAddress={userKarmaIncrementData.userAddress}
                  userKarmaIncrement={userKarmaIncrementData.karmaIncrement}
                />
              )
            })}
          </Tbody>
        </Table>
      </TableContainer>
    </Stack>
  )
}
