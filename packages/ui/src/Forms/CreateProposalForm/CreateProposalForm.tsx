import { MinusIcon, AddIcon } from '@chakra-ui/icons'
import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Box,
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  IconButton,
  Input,
  InputGroup,
  InputLeftAddon,
  InputRightElement,
  Stack,
  useToast,
} from '@chakra-ui/react'
import { useCreateProposal } from '@dae/snapshot'
import { useFormik } from 'formik'
import React, { ChangeEvent, useEffect } from 'react'
import * as Yup from 'yup'
import { useCourseData } from '../../CourseProvider'
import { useRouter } from 'next/router'
import { Address } from 'viem'
import Editor, { EditorContentChanged } from '../../Editor/Editor'

const validationSchema = Yup.object().shape({
  title: Yup.string().required('Name is required'),
  description: Yup.string().required('Description is required'),
  discussionLink: Yup.string().url('Invalid URL format'),
  endDate: Yup.date().required('End Date is required'),
  choices: Yup.array()
    .of(Yup.string().required('Choice is required'))
    .min(1, 'At least one choice is required'),
})

export const CreateProposalForm: React.FC = () => {
  const { data } = useCourseData()
  const toast = useToast()
  const { create, isLoading, isError, isSuccess, error } = useCreateProposal(
    data ? data.snapshot_space_ens : undefined,
  )
  const router = useRouter()

  const {
    values,
    errors,
    touched,
    handleBlur,
    handleChange,
    handleSubmit,
    setFieldValue,
  } = useFormik({
    initialValues: {
      title: '',
      description: '',
      discussionLink: '',
      choices: [''],
      endDate: undefined,
    },
    onSubmit: async (values) => {
      try {
        if (!values.endDate) {
          throw new Error('End date is unset.')
        }
        const result = await create(
          values.title,
          values.description,
          values.choices,
          (values.endDate as Date).getTime() / 1000,
          values.discussionLink,
        )

        router.push(
          `/course/${router.query.address as Address}/proposals/${result.id}`,
        )
      } catch (_e) {}
    },
    validationSchema: validationSchema,
  })

  useEffect(() => {
    if (isError) {
      toast({
        title: 'Error creating credential.',
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
        title: 'Creating new proposal...',
        status: 'info',
      })
    }
  }, [isLoading, isError, isSuccess])

  return (
    <Box padding={8} borderRadius="xl" bg={'white'} boxShadow={'base'}>
      <form onSubmit={handleSubmit}>
        <Stack spacing={4}>
          <FormControl isRequired isInvalid={!!errors.title && touched.title}>
            <FormLabel>Title</FormLabel>
            <Input
              id="title"
              value={values.title}
              onChange={handleChange}
              onBlur={handleBlur}
              type="text"
              placeholder="Title"
            />
            <FormErrorMessage>{errors.title}</FormErrorMessage>
          </FormControl>
          <FormControl
            isRequired
            isInvalid={!!errors.description && touched.description}
          >
            <FormLabel>Description</FormLabel>
            <Editor
              id="description"
              value={values.description}
              onChange={(content: EditorContentChanged) => {
                setFieldValue('description', content.markdown)
              }}
              placeholder="Description"
            />
            <FormErrorMessage>{errors.description}</FormErrorMessage>
          </FormControl>
          <FormControl
            isRequired
            isInvalid={!!errors.endDate && touched.endDate}
          >
            <FormLabel>Voting ends on</FormLabel>
            <Input
              placeholder="Select Date and Time"
              size="md"
              type="datetime-local"
              onChange={(event: ChangeEvent<HTMLInputElement>) => {
                const date = new Date(event.target.value)
                setFieldValue('endDate', date)
              }}
            />
            <FormErrorMessage>{errors.endDate}</FormErrorMessage>
          </FormControl>
          <FormControl
            isRequired
            isInvalid={!!errors.choices && touched.choices}
          >
            <FormLabel>Choices</FormLabel>
            <Stack spacing={4}>
              {values.choices.map((choice, index) => (
                <InputGroup key={index}>
                  <InputLeftAddon>{index + 1}.</InputLeftAddon>
                  <Input
                    value={choice}
                    onChange={(event) => {
                      const newChoices: string[] = [...values.choices]
                      newChoices[index] = event.target.value
                      setFieldValue('choices', newChoices)
                    }}
                    placeholder={`Choice ${index + 1}`}
                  />
                  {index !== 0 && (
                    <InputRightElement width="4.5rem">
                      <IconButton
                        size="sm"
                        onClick={() => {
                          const updatedChoices = [...values.choices]
                          updatedChoices.splice(index, 1)
                          setFieldValue('choices', updatedChoices)
                        }}
                        aria-label="Remove choice"
                        icon={<MinusIcon />}
                        variant="ghost"
                      />
                    </InputRightElement>
                  )}
                </InputGroup>
              ))}
              {values.choices.length < 10 && (
                <Box>
                  <Button
                    size="sm"
                    onClick={() => {
                      if (values.choices.length < 10) {
                        setFieldValue('choices', [...values.choices, ''])
                      }
                    }}
                    leftIcon={<AddIcon />}
                    variant="ghost"
                  >
                    Add Choice
                  </Button>
                </Box>
              )}
            </Stack>
            <FormErrorMessage>{errors.choices}</FormErrorMessage>
          </FormControl>
          <FormControl
            isInvalid={!!errors.discussionLink && touched.discussionLink}
          >
            <FormLabel>Discussion Link</FormLabel>
            <Input
              id="discussionLink"
              value={values.discussionLink}
              onChange={handleChange}
              onBlur={handleBlur}
              type="text"
              placeholder="https://www.proposalforum.com"
            />
            <FormErrorMessage>{errors.description}</FormErrorMessage>
          </FormControl>
          <Button
            colorScheme="blue"
            type="submit"
            isLoading={isLoading}
            loadingText="Submitting"
          >
            Create proposal
          </Button>
          {isError ? (
            <Alert status="error">
              <AlertIcon />
              <Box>
                <AlertTitle>Something went wrong.</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Box>
            </Alert>
          ) : (
            <></>
          )}
        </Stack>
      </form>
    </Box>
  )
}
