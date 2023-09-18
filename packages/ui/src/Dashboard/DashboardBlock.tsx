import { Stat, StatLabel, StatNumber } from '@chakra-ui/react'
import React from 'react'

type DashboardBlockProps = {
  title: string
  value: number | undefined
  isInt?: boolean
}

export const DashboardBlock: React.FC<DashboardBlockProps> = ({
  title,
  value,
  isInt = false,
}) => {
  const formattedValue =
    (value && (isInt ? Math.round(value) : value.toFixed(2))) ?? '--'

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
      <StatNumber fontSize={'4xl'}>{formattedValue}</StatNumber>
    </Stat>
  )
}
