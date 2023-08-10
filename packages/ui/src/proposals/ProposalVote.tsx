import React, { useEffect } from 'react'
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
} from '@chakra-ui/react'
import { Proposal, useVotePropsal } from '@dae/snapshot'
import { ChainSnapshotHub } from '@dae/chains'
import { useFormik } from 'formik'
import * as Yup from 'yup'

const validationSchema = Yup.object().shape({
  vote: Yup.string().required('Vote is required'),
  reason: Yup.string(),
})

type ProposalVoteProps = {
  proposal: Proposal
}

export const ProposalVote: React.FC<ProposalVoteProps> = ({ proposal }) => {
  const toast = useToast()

  const { vote, isError, isLoading, isSuccess, error } = useVotePropsal(
    proposal.space.id,
    parseInt(proposal.network) as keyof typeof ChainSnapshotHub,
    proposal.id,
    proposal.type,
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
      try {
        vote(values.vote, values.reason)
      } catch (_e) {}
    },
    validationSchema: validationSchema,
  })

  useEffect(() => {
    if (isError) {
      toast({
        title: 'Error voting proposal.',
        status: 'error',
      })
    }
    if (isSuccess) {
      toast({
        title: 'Succefully voted proposal',
        status: 'success',
      })
    }
    if (isLoading) {
      toast({
        title: 'Voting proposal...',
        status: 'info',
      })
    }
  }, [isLoading, isError, isSuccess])

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
            id="motivation"
            value={values.reason}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="Motivation..."
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
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Box>
          </Alert>
        ) : (
          <></>
        )}
      </Stack>
    </form>
  )
}
