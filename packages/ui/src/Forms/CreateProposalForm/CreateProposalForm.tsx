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
import React, { ChangeEvent } from 'react'
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
  const { create, isLoading, isError, error, isValidating } = useCreateProposal(
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
    resetForm,
  } = useFormik({
    initialValues: {
      title: '',
      description: '',
      discussionLink: '',
      choices: [''],
      endDate: undefined,
    },
    onSubmit: async (values) => {
      if (!values.endDate) return
      toast.promise(
        create(
          values.title,
          values.description,
          values.choices,
          (values.endDate as Date).getTime() / 1000,
          values.discussionLink,
        ).then((result) => {
          resetForm()
          router.push(
            `/course/${router.query.address as Address}/proposals/${result.id}`,
          )
        }),
        {
          success: {
            title: 'Proposal created with success!',
          },
          error: { title: 'Error creating proposal.' },
          loading: {
            title: 'Creating proposal...',
          },
        },
      )
    },
    validationSchema: validationSchema,
  })

  return (
    <Box padding={8} borderRadius="xl" bg={'white'} boxShadow={'md'}>
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
              isDisabled={isLoading || isValidating}
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
              isDisabled={isLoading || isValidating}
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
              isDisabled={isLoading || isValidating}
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
                    isDisabled={isLoading || isValidating}
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
                        isDisabled={isLoading || isValidating}
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
                    isDisabled={isLoading || isValidating}
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
              isDisabled={isLoading || isValidating}
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
                <AlertDescription>{error?.message}</AlertDescription>
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
