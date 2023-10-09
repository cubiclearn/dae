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
  Input,
  Stack,
  Textarea,
  useToast,
} from '@chakra-ui/react'
import { useCreateCredential } from '@dae/wagmi'
import { useFormik } from 'formik'
import { useRouter } from 'next/router'
import React, { useRef } from 'react'
import { Address, useNetwork } from 'wagmi'
import * as Yup from 'yup'
import { checkFileSize, checkFileType } from '../utils'
import {
  MAXIMUM_ALLOWED_UPLOAD_FILE_SIZE,
  SUPPORTED_IMAGE_FILE_TYPES,
} from '@dae/constants'

const validationSchema = Yup.object().shape({
  name: Yup.string()
    .required('Name is required')
    .max(32, 'Name should not exceed 32 characters.'),
  description: Yup.string()
    .required('Description is required')
    .max(160, 'Description should not exceed 160 characters.'),
  image: Yup.mixed()
    .required('Image is required.')
    .test(
      'fileType',
      'Please select a valid image file.',
      (file) => file && checkFileType(file as File, SUPPORTED_IMAGE_FILE_TYPES),
    )
    .test(
      'fileSize',
      `Image exceeds maximum allowed file size of ${
        MAXIMUM_ALLOWED_UPLOAD_FILE_SIZE / (1024 * 1024)
      }MB.`,
      (file) =>
        file && checkFileSize(file as File, MAXIMUM_ALLOWED_UPLOAD_FILE_SIZE),
    ),
})

type CreateCredentialsFormProps = {
  courseAddress: string
}

export const CreateCredentialsForm: React.FC<CreateCredentialsFormProps> = ({
  courseAddress,
}) => {
  const { create, isLoading, isError, error, isValidating } =
    useCreateCredential()
  const imageInputRef = useRef<HTMLInputElement | null>(null)
  const { chain } = useNetwork()
  const router = useRouter()
  const toast = useToast()

  const handleImageInputFieldChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0]
    setFieldValue('image', file)
  }

  const handleResetImageInputField = () => {
    if (imageInputRef.current) {
      imageInputRef.current.value = ''
    }
    setFieldValue('image', null)
  }

  const {
    values,
    errors,
    touched,
    handleBlur,
    handleChange,
    handleSubmit,
    setFieldValue,
    resetForm,
    handleReset,
  } = useFormik<{ name: string; description: string; image: File | null }>({
    initialValues: {
      name: '',
      description: '',
      image: null,
    },
    onSubmit: async (values) => {
      if (!values.image || !chain) return
      toast.promise(
        create(
          values.image,
          values.name,
          values.description,
          courseAddress as Address,
          chain.id,
        ).then(() => {
          resetForm()
          handleResetImageInputField()
          router.push(`/course/${courseAddress}/credentials/list`)
        }),
        {
          success: {
            title: 'Credential created with success!',
          },
          error: { title: 'Error creating credential.' },
          loading: {
            title: 'Credential creation in progress...',
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
          <FormControl isRequired isInvalid={!!errors.name && touched.name}>
            <FormLabel>Name</FormLabel>
            <Input
              id="name"
              value={values.name}
              onChange={handleChange}
              onBlur={handleBlur}
              type="text"
              placeholder="Name"
              onReset={handleReset}
              isDisabled={isLoading || isValidating}
            />
            <FormErrorMessage>{errors.name}</FormErrorMessage>
          </FormControl>
          <FormControl
            isRequired
            isInvalid={!!errors.description && touched.description}
          >
            <FormLabel>Description</FormLabel>
            <Textarea
              id="description"
              value={values.description}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Description"
              onReset={handleReset}
              isDisabled={isLoading || isValidating}
            />
            <FormErrorMessage>{errors.description}</FormErrorMessage>
          </FormControl>
          <FormControl isRequired isInvalid={!!errors.image && touched.image}>
            <FormLabel>Image</FormLabel>
            <Input
              py={1}
              id="image"
              type="file"
              onChange={handleImageInputFieldChange}
              onBlur={handleBlur}
              onReset={handleResetImageInputField}
              ref={imageInputRef}
              isDisabled={isLoading || isValidating}
            />
            <FormErrorMessage>{errors.image}</FormErrorMessage>
          </FormControl>
          <Button
            colorScheme="blue"
            type="submit"
            isLoading={isLoading}
            loadingText="Submitting"
          >
            Create credential
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
