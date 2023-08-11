import { Text, Stack } from '@chakra-ui/react'
import React, { useEffect, useState } from 'react'

type TimeLeft = {
  days: number
  hours: number
  minutes: number
  seconds: number
}

type ProposalCountdownTimerProps = {
  timestamp: number
}

function timestampToDate(timestamp: number) {
  const date = new Date(timestamp * 1000)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

export const ProposalCountdownTimer: React.FC<ProposalCountdownTimerProps> = ({
  timestamp,
}) => {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  })

  useEffect(() => {
    const interval = setInterval(() => {
      const currentTime = Math.floor(Date.now() / 1000)
      const remainingTime = timestamp - currentTime

      if (remainingTime <= 0) {
        clearInterval(interval)
        setTimeLeft({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
        })
      } else {
        const days = Math.floor(remainingTime / (60 * 60 * 24))
        const hours = Math.floor((remainingTime % (60 * 60 * 24)) / (60 * 60))
        const minutes = Math.floor((remainingTime % (60 * 60)) / 60)
        const seconds = remainingTime % 60

        setTimeLeft({
          days,
          hours,
          minutes,
          seconds,
        })
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [timestamp])

  if (Date.now() / 1000 > timestamp) {
    return (
      <Stack spacing={2}>
        <Text fontSize={'xl'} fontWeight={'semibold'}>
          Ended on:
        </Text>
        <Text fontSize={'lg'}>{timestampToDate(timestamp)}</Text>
      </Stack>
    )
  }

  return (
    <Stack spacing={4}>
      <Text fontSize={'xl'} fontWeight={'semibold'}>
        Voting ends in:
      </Text>
      <Stack direction="row" spacing={4}>
        <Stack width={'25%'}>
          <Text fontSize={'lg'}>{timeLeft.days}</Text>
          <Text>Days</Text>
        </Stack>
        <Stack width={'25%'}>
          <Text fontSize={'lg'}>{timeLeft.hours}</Text>
          <Text>Hours</Text>
        </Stack>
        <Stack width={'25%'}>
          <Text fontSize={'lg'}>{timeLeft.minutes}</Text>
          <Text>Minutes</Text>
        </Stack>
        <Stack width={'25%'}>
          <Text fontSize={'lg'}>{timeLeft.seconds}</Text>
          <Text>Seconds</Text>
        </Stack>
      </Stack>
    </Stack>
  )
}
