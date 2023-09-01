import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Box,
  Center,
  SimpleGrid,
  Spinner,
  Stat,
  StatLabel,
  StatNumber,
} from '@chakra-ui/react'
import { useKarmaBalance } from '@dae/wagmi'
import { Address } from 'viem'
import { useCourseData } from '../CourseProvider'

type KarmaRatingContainerProps = {
  userAddress: Address | undefined
}

export const KarmaRatingContainer: React.FC<KarmaRatingContainerProps> = ({
  userAddress,
}) => {
  const { data: courseData, error: errorLoadingCourseData } = useCourseData()
  const {
    data: karmaBalance,
    isLoading,
    error,
  } = useKarmaBalance(
    courseData
      ? (courseData.karma_access_control_address as Address)
      : undefined,
    userAddress,
  )

  if (isLoading || (!courseData && !errorLoadingCourseData)) {
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
          <AlertTitle>Something went wrong.</AlertTitle>
          <AlertDescription>{error.message}</AlertDescription>
        </Box>
      </Alert>
    )
  }

  return (
    <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 5 }} spacing={4}>
      <Stat
        size={'md'}
        borderRadius={'lg'}
        borderWidth={'1px'}
        padding={4}
        background={'white'}
        boxShadow={'md'}
      >
        <StatLabel fontSize={'md'}>My karma rating</StatLabel>
        <StatNumber fontSize={'4xl'}>
          {karmaBalance ? Number(karmaBalance) : '--'}
        </StatNumber>
      </Stat>
    </SimpleGrid>
  )
}
