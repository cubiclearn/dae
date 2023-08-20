import { Stat, StatLabel, StatNumber } from '@chakra-ui/react'
import React from 'react'

type DashboardBlockProps = {
  title: string
  value: number
  isInt?: boolean
}

export const DashboardBlock: React.FC<DashboardBlockProps> = ({
  title,
  value,
  isInt = false,
}) => {
  return (
    <Stat
      size={'md'}
      borderRadius={'lg'}
      borderWidth={'1px'}
      padding={4}
      background={'white'}
      boxShadow={'md'}
    >
      <StatLabel fontSize={'md'}>{title}</StatLabel>
      <StatNumber fontSize={'4xl'}>
        {isInt ? value : value.toFixed(2)}
      </StatNumber>
    </Stat>
  )
}
