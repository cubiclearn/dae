import { Stat, StatLabel, StatNumber } from '@chakra-ui/react'
import React from 'react'

type DashboardBlockProps = {
  title: string
  value: number | undefined
  isInt?: boolean
}

const formatValue = (value: number | undefined, toInt = false): string => {
  if (!value || isNaN(Number(value))) {
    return '0'
  }
  if (toInt) {
    return Math.round(value).toString()
  }

  return value.toFixed(2)
}

export const DashboardBlock: React.FC<DashboardBlockProps> = ({
  title,
  value,
  isInt = false,
}) => {
  const formattedValue = formatValue(value, isInt)

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
