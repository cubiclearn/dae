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
  useToast,
} from '@chakra-ui/react'
import { useCreateCredential } from '@dae/wagmi'
import { useFormik } from 'formik'
import { useRouter } from 'next/router'
import React, { useEffect } from 'react'
import { Address, useNetwork } from 'wagmi'
import * as Yup from 'yup'

const validationSchema = Yup.object().shape({
  name: Yup.string().required('Name is required'),
  description: Yup.string().required('Description is required'),
  image: Yup.mixed().required('Image is required'),
})

type CreateCredentialsFormProps = {
  courseAddress: string
}

export const CreateCredentialsForm: React.FC<CreateCredentialsFormProps> = ({
  courseAddress,
}) => {
  const { create, isLoading, isSuccess, isError, error } = useCreateCredential()
  const { chain } = useNetwork()
  const router = useRouter()
  const toast = useToast()

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
      name: '',
      description: '',
      image: null,
    },
    onSubmit: async (values) => {
      try {
        if (!values.image || !chain) {
          return
        }
        await create(
          values.image,
          values.name,
          values.description,
          courseAddress as Address,
          chain.id,
        )
        router.push(`/course/${courseAddress}/credentials/list`)
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
        title: 'Credential created with success!',
        status: 'success',
      })
    }
    if (isLoading) {
      toast({
        title: 'Creating new credential...',
        status: 'info',
      })
    }
  }, [isLoading, isError, isSuccess])

  return (
    <Box padding={8} borderRadius="xl" bg={'white'} boxShadow={'base'}>
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
            />
            <FormErrorMessage>{errors.name}</FormErrorMessage>
          </FormControl>
          <FormControl
            isRequired
            isInvalid={!!errors.description && touched.description}
          >
            <FormLabel>Description</FormLabel>
            <Input
              id="description"
              value={values.description}
              onChange={handleChange}
              onBlur={handleBlur}
              type="text"
              placeholder="Description"
            />
            <FormErrorMessage>{errors.description}</FormErrorMessage>
          </FormControl>
          <FormControl isRequired>
            <FormLabel>Image</FormLabel>
            <Input
              py={1}
              id="image"
              type="file"
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                const file = event.target.files?.[0]
                setFieldValue('image', file)
              }}
              onBlur={handleBlur}
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
                <AlertDescription>
                  {error && error instanceof Error
                    ? error.message
                    : 'Unknown Error'}
                </AlertDescription>
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
