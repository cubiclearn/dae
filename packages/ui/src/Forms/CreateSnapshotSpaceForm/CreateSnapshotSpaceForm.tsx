import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Box,
  Button,
  Center,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Select,
  Spinner,
  Stack,
  Text,
  useToast,
} from '@chakra-ui/react'
import { useCreateSnapshotSpace } from '@dae/snapshot'
import { useFormik } from 'formik'
import React from 'react'
import * as Yup from 'yup'
import { useCourseData } from '../../CourseProvider'
import { type VotingStrategy } from '@dae/types'
import { useIsENSOwner } from '@dae/wagmi'
import { useAccount } from 'wagmi'

const validationSchema = Yup.object().shape({
  votingStrategy: Yup.string()
    .required('Voting strategy is required.')
    .matches(/^(linear-voting|quadratic-voting)$/, 'Invalid voting type'),
})

export const CreateSnapshotSpaceForm: React.FC = () => {
  const { data: courseData } = useCourseData()
  const { address } = useAccount()
  const {
    data: isENSOwner,
    isLoading: isLoadingENSOwner,
    isError: isErrorLoadingENSOwner,
  } = useIsENSOwner(address, courseData?.snapshot_space_ens)

  const { create, isLoading, isError, error, isValidating } =
    useCreateSnapshotSpace()
  const toast = useToast()

  const { values, errors, touched, handleChange, handleSubmit } = useFormik<{
    votingStrategy: VotingStrategy
  }>({
    initialValues: {
      votingStrategy: 'linear-voting',
    },
    onSubmit: async (values) => {
      if (!courseData) return
      toast.promise(
        create(
          courseData.snapshot_space_ens,
          courseData.name,
          courseData.symbol,
          courseData.description,
          courseData.image_url,
          courseData.karma_access_control_address,
          values.votingStrategy,
        ),
        {
          success: { title: 'Snapshot space has been correctly configured.' },
          error: { title: 'Error configuring snapshot space.' },
          loading: { title: 'Snapshot space configuration in progress...' },
        },
      )
    },
    validationSchema: validationSchema,
  })

  if (isLoadingENSOwner) {
    return (
      <Center>
        <Spinner />
      </Center>
    )
  }

  if (isErrorLoadingENSOwner) {
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

  if (!isENSOwner) {
    return (
      <Alert status="warning">
        <AlertIcon />
        <Box>
          <AlertTitle>Voting space not configured</AlertTitle>
          <AlertDescription>
            It appears that this course space has not been configured. Wait the
            course administrator to configure it before making and voting
            proposals.
          </AlertDescription>
        </Box>
      </Alert>
    )
  }

  return (
    <Box padding={8} borderRadius="xl" bg={'white'} boxShadow={'md'}>
      <form onSubmit={handleSubmit}>
        <Stack spacing={6}>
          <Box>
            <Stack spacing={1}>
              <Text fontWeight={'semibold'} fontSize={'2xl'}>
                Create snapshot space
              </Text>
              <Text fontSize={'sm'}>
                Seams like that the snapshot space does not exist or it's
                configured uncorrectly. Select a voting strategy and click on
                the "Create" button to reconfigure that.
              </Text>
            </Stack>
          </Box>
          <Stack spacing={4}>
            <FormControl
              isRequired
              isInvalid={!!errors.votingStrategy && touched.votingStrategy}
            >
              <FormLabel>Voting strategy</FormLabel>
              <Select
                id="votingStrategy"
                placeholder="Select voting strategy"
                onChange={handleChange}
                value={values.votingStrategy}
                isDisabled={isLoading || isValidating}
              >
                <option value={'linear-voting'}>Linear Voting</option>
                <option value={'quadratic-voting'}>Quadratic Voting</option>
              </Select>
              <FormErrorMessage>{errors.votingStrategy}</FormErrorMessage>
            </FormControl>
            <Button
              colorScheme="blue"
              type="submit"
              isLoading={isLoading}
              loadingText="Submitting"
            >
              Create
            </Button>
            {isError ? (
              <Alert status="error">
                <AlertIcon />
                <Box>
                  <AlertTitle>Something went wrong.</AlertTitle>
                  <AlertDescription>{error?.message}</AlertDescription>
                </Box>
              </Alert>
            ) : (
              <></>
            )}
          </Stack>
        </Stack>
      </form>
    </Box>
  )
}
