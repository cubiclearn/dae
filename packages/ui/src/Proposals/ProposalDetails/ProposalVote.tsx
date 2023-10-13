import React, { useState } from 'react'
import {
  Button,
  Select,
  Text,
  useToast,
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Box,
  FormControl,
  FormErrorMessage,
  Stack,
  FormLabel,
  Textarea,
  Center,
  Spinner,
} from '@chakra-ui/react'
import {
  useCourseProposalUserVote,
  useCourseProposalUserVotingPower,
  useVotePropsal,
} from '@dae/snapshot'
import { ChainSnapshotHub } from '@dae/chains'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import { Address, useAccount, useNetwork } from 'wagmi'
import { Proposal } from '@dae/snapshot'

const validationSchema = Yup.object().shape({
  vote: Yup.string().required('Vote is required'),
  reason: Yup.string().max(140, 'Reason should not exceed 140 characters.'),
})

type ProposalVoteProps = {
  courseAddress: Address
  proposal: Proposal
}

export const ProposalVote: React.FC<ProposalVoteProps> = ({
  courseAddress,
  proposal,
}) => {
  const { chain } = useNetwork()
  const toast = useToast()
  const { address: userAddress } = useAccount()

  const { vote, isError, isLoading, error } = useVotePropsal(
    proposal.space.id,
    parseInt(proposal.network) as keyof typeof ChainSnapshotHub,
    proposal.id,
    proposal.type,
  )

  const { data: userVote, isLoading: isLoadingVote } =
    useCourseProposalUserVote(proposal.id, chain?.id, userAddress)

  const [showRevoteForm, setShowRevoteForm] = useState(false)

  const { data: votingPower, isLoading: isLoadingVotingPower } =
    useCourseProposalUserVotingPower(
      courseAddress,
      proposal.id,
      chain?.id,
      userAddress,
    )

  const {
    values,
    errors,
    touched,
    handleBlur,
    handleSubmit,
    setFieldValue,
    handleChange,
  } = useFormik({
    initialValues: {
      vote: 1,
      reason: '',
    },
    onSubmit: async (values) => {
      toast.promise(vote(values.vote, values.reason), {
        success: {
          title: 'Proposal voted with success!',
        },
        error: { title: 'Error voting proposal.' },
        loading: {
          title: 'Voting in progress...',
        },
      })
    },
    validationSchema: validationSchema,
  })

  const handleRevoteButtonClick = () => {
    setShowRevoteForm(true)
  }

  if (isLoadingVote || isLoadingVotingPower) {
    return (
      <Stack spacing={4}>
        <Text fontSize={'lg'} fontWeight={'bold'}>
          Cast a vote
        </Text>
        <Center>
          <Spinner />
        </Center>
      </Stack>
    )
  }

  if (!votingPower || !votingPower.vp) {
    return (
      <Alert status="warning">
        <AlertIcon />
        <Box>
          <AlertTitle>You are not allowed to vote this proposal.</AlertTitle>
          <AlertDescription>
            You do not have the necessary permissions to vote on this proposal.
            To vote, you must hold either MAGISTER or DISCIPULUS credentials for
            this course at the snapshot block.
          </AlertDescription>
        </Box>
      </Alert>
    )
  }

  if (userVote && userVote.votes.length > 0 && !showRevoteForm) {
    return (
      <Stack spacing={4}>
        <Text fontSize={'lg'} fontWeight={'bold'}>
          Cast a vote
        </Text>
        <Alert status="success">
          <AlertIcon />
          <Box>
            <AlertTitle>You have already voted!</AlertTitle>
            <AlertDescription>
              <Text>You have successfully voted for the option:</Text>
              <Text>{`${userVote.votes[0].choice}. ${
                proposal.choices[userVote.votes[0].choice - 1]
              }`}</Text>
            </AlertDescription>
          </Box>
        </Alert>
        <Button colorScheme="blue" onClick={handleRevoteButtonClick}>
          Change Vote
        </Button>
      </Stack>
    )
  }

  return (
    <form onSubmit={handleSubmit}>
      <Stack spacing={4}>
        <Text fontSize={'lg'} fontWeight={'bold'}>
          Cast a vote
        </Text>
        <FormControl isRequired isInvalid={!!errors.vote && touched.vote}>
          <FormLabel>Vote</FormLabel>
          <Select
            onChange={(event: any) => {
              const targetValue = parseInt(event.target.value)
              setFieldValue('vote', targetValue)
            }}
            onBlur={handleBlur}
            value={values.vote}
          >
            {proposal.choices.map((choice, index) => {
              return (
                <option key={index + 1} value={index + 1}>
                  {choice}
                </option>
              )
            })}
          </Select>
          <FormErrorMessage>{errors.vote}</FormErrorMessage>
        </FormControl>
        <FormControl isInvalid={!!errors.reason && touched.reason}>
          <FormLabel>Reason</FormLabel>
          <Textarea
            id="reason"
            value={values.reason}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="Reason..."
          />
          <FormErrorMessage>{errors.reason}</FormErrorMessage>
        </FormControl>
        <Button
          colorScheme="blue"
          type="submit"
          isLoading={isLoading}
          loadingText="Submitting"
        >
          Vote
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
    </form>
  )
}
