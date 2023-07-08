import {
  Box,
  Button,
  FormControl,
  FormLabel,
  IconButton,
  Input,
  InputGroup,
  InputRightElement,
  Stack,
  VStack,
  InputLeftAddon,
  useToast,
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
} from '@chakra-ui/react'
import { useCreateProposal } from '@dae/snapshot'
import { ChangeEvent, FormEvent, useCallback, useEffect, useState } from 'react'
import { useCourseData } from '../../CourseProvider'
import { AddIcon, MinusIcon } from '@chakra-ui/icons'

export const CreateProposalForm = () => {
  const { data } = useCourseData()
  const toast = useToast()
  const { create, isLoading, isError, isSuccess, error } = useCreateProposal(
    data ? data.snapshot_space_ens : undefined,
  )

  useEffect(() => {
    if (isError) {
      toast({
        title: 'Error creating proposal.',
        status: 'error',
      })
    }
    if (isSuccess) {
      toast({
        title: 'Proposal created with success!',
        status: 'success',
      })
    }
    if (isLoading) {
      toast({
        title: 'Creating proposal...',
        status: 'info',
      })
    }
  }, [isLoading, isError, isSuccess])

  const [proposalTitle, setProposalTitle] = useState<string>('')
  const [proposalDescription, setProposalDescription] = useState<string>('')
  const [proposalDiscussionLink, setProposalDiscussionLink] =
    useState<string>('')
  const [proposalChoices, setProposalChoices] = useState<string[]>([])
  const [proposalEndDate, setProposalEndDate] = useState(new Date())

  const handleProposalTitleChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const input = event.target.value
      setProposalTitle(input)
    },
    [],
  )

  const handleProposalDescriptionChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const input = event.target.value
      setProposalDescription(input)
    },
    [],
  )

  const handleProposalDiscussionLinkChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const input = event.target.value
      setProposalDiscussionLink(input)
    },
    [],
  )

  const handleProposalEndDate = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      // Create a Date object from the datetime-local value
      const date = new Date(event.target.value)
      setProposalEndDate(date)
    },
    [],
  )

  const handleChoiceChange = (
    index: number,
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const updatedChoices = [...proposalChoices]
    updatedChoices[index] = event.target.value
    setProposalChoices(updatedChoices)
  }

  const addChoice = () => {
    if (proposalChoices.length < 10) {
      setProposalChoices([...proposalChoices, ''])
    }
  }

  const removeChoice = (index: number) => {
    const updatedChoices = [...proposalChoices]
    updatedChoices.splice(index, 1)
    setProposalChoices(updatedChoices)
  }

  const clearInputFields = () => {
    setProposalTitle('')
    setProposalDescription('')
    setProposalDiscussionLink('')
    setProposalChoices([''])
  }

  const handleCreateProposal = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    try {
      if (!data) {
        throw new Error("You're not connected to Web3")
      }
      await create(
        proposalTitle,
        proposalDescription,
        proposalChoices,
        proposalEndDate.getTime() / 1000,
        proposalDiscussionLink,
      )
      clearInputFields()
    } catch (_e) {}
  }
  return (
    <Box padding={8} borderRadius='xl' borderColor='gray.300' borderWidth='1px'>
      <form onSubmit={handleCreateProposal}>
        <VStack spacing={4} alignItems={'flex-start'}>
          <FormControl>
            <FormLabel>Title:</FormLabel>
            <Input
              onChange={handleProposalTitleChange}
              value={proposalTitle}
              type='text'
            />
          </FormControl>
          <FormControl>
            <FormLabel>Description:</FormLabel>
            <Input
              onChange={handleProposalDescriptionChange}
              value={proposalDescription}
              type='text'
            />
          </FormControl>
          <FormControl>
            <FormLabel>Voting ends on</FormLabel>
            <Input
              placeholder='Select Date and Time'
              size='md'
              type='datetime-local'
              onChange={handleProposalEndDate}
            />
          </FormControl>
          <FormLabel>Choices</FormLabel>
          <Stack spacing={4}>
            {proposalChoices.map((choice, index) => (
              <InputGroup key={index}>
                <InputLeftAddon>{index + 1}.</InputLeftAddon>
                <Input
                  value={choice}
                  onChange={(event) => handleChoiceChange(index, event)}
                  placeholder={`Choice ${index + 1}`}
                />
                {index !== 0 && (
                  <InputRightElement width='4.5rem'>
                    <IconButton
                      size='sm'
                      onClick={() => removeChoice(index)}
                      aria-label='Remove choice'
                      icon={<MinusIcon />}
                      variant='ghost'
                    />
                  </InputRightElement>
                )}
              </InputGroup>
            ))}
            {proposalChoices.length < 10 && (
              <Box>
                <Button
                  size='sm'
                  onClick={addChoice}
                  leftIcon={<AddIcon />}
                  variant='ghost'
                >
                  Add Choice
                </Button>
              </Box>
            )}
          </Stack>
          <FormControl>
            <FormLabel>Discussion link:</FormLabel>
            <Input
              onChange={handleProposalDiscussionLinkChange}
              value={proposalDiscussionLink}
              type='text'
            />
          </FormControl>
          <Button type='submit'>Create proposal</Button>
          {isError ? (
            <Alert status='error'>
              <AlertIcon />
              <Box>
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Box>
            </Alert>
          ) : (
            <></>
          )}
        </VStack>
      </form>
    </Box>
  )
}
