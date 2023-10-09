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
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  Select,
  Stack,
  Textarea,
  useSteps,
  useToast,
} from '@chakra-ui/react'
import { useCreateCourse, useIsENSOwner } from '@dae/wagmi'
import { useFormik } from 'formik'
import { useRouter } from 'next/router'
import { useEffect, useRef } from 'react'
import { useAccount, useNetwork } from 'wagmi'
import * as Yup from 'yup'
import { ProgressStepper } from '../../Stepper'
import {
  MAXIMUM_ALLOWED_UPLOAD_FILE_SIZE,
  SUPPORTED_IMAGE_FILE_TYPES,
} from '@dae/constants'
import { checkFileType, checkFileSize } from '../utils'
import { type VotingStrategy } from '@dae/types'

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
  website: Yup.string()
    .url('Invalid website URL')
    .required('Website is required'),
  mediaChannel: Yup.string().url('Invalid media channel URL'),
  discipulusBaseKarma: Yup.number()
    .min(0, 'Students base karma must be greater than or equal to 0')
    .typeError('Students base karma must be a number')
    .required('Students base karma is required'),
  magisterBaseKarma: Yup.number()
    .min(0, 'Teacher base karma must be greater than or equal to 0')
    .typeError('Teacher base karma must be a number')
    .required('Teacher base karma is required'),
  snapshotSpaceENS: Yup.string()
    .required('Snapshot Space ENS is required')
    .matches(
      /^([a-z0-9-]+\.eth)$/i,
      'Invalid Snapshot Space ENS format (e.g., your-ens.eth)',
    ),
  votingStrategy: Yup.string()
    .required('Voting strategy is required.')
    .matches(/^(linear-voting|quadratic-voting)$/, 'Invalid voting type'),
})

export const CreateCourseForm = () => {
  const { chain } = useNetwork()
  const { address } = useAccount()
  const imageInputRef = useRef<HTMLInputElement | null>(null)

  const { create, isLoading, isError, error, isSigning, isValidating, step } =
    useCreateCourse(chain, address)
  const toast = useToast()
  const router = useRouter()

  const steps = [
    {
      title: 'Uploading Course Files',
      description:
        'Course files are currently being uploaded to the IPFS network for storage.',
    },
    {
      title: 'Signing Transaction',
      description:
        'Sign the transaction to securely create a record on the blockchain.',
    },
    {
      title: 'Processing Transaction',
      description:
        'The signed transaction is now being processed on the blockchain for confirmation.',
    },
    {
      title: 'Registering Snapshot Space',
      description:
        'Sign a message to register a Snapshot space for the course data.',
    },
  ]

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

  const { activeStep, setActiveStep } = useSteps({
    index: 0,
    count: steps.length,
  })

  const {
    values,
    errors,
    touched,
    handleBlur,
    handleChange,
    handleSubmit,
    setFieldValue,
    resetForm,
  } = useFormik<{
    name: string
    description: string
    image: File | null
    website: string
    mediaChannel: string
    discipulusBaseKarma: number
    magisterBaseKarma: number
    snapshotSpaceENS: string
    votingStrategy: VotingStrategy
  }>({
    initialValues: {
      name: '',
      description: '',
      image: null,
      website: '',
      mediaChannel: '',
      discipulusBaseKarma: 0,
      magisterBaseKarma: 0,
      snapshotSpaceENS: '',
      votingStrategy: 'linear-voting',
    },
    onSubmit: async (values) => {
      if (!values.image) return
      toast.promise(
        create(
          values.name,
          values.description,
          values.image,
          values.website,
          values.mediaChannel,
          values.magisterBaseKarma,
          values.discipulusBaseKarma,
          values.snapshotSpaceENS,
          values.votingStrategy,
        ).then(() => {
          handleResetImageInputField()
          resetForm()
          router.push('/profile/courses/teaching')
        }),
        {
          success: {
            title: 'Course created with success!',
          },
          error: { title: 'Error creating course.' },
          loading: {
            title: 'Course creation in progress...',
            description:
              'Processing transaction on the blockchain can take some time (usually around one minute).',
          },
        },
      )
    },
    validationSchema: validationSchema,
  })

  const { data: isENSOwner } = useIsENSOwner(address, values.snapshotSpaceENS)

  useEffect(() => {
    if (isLoading && step) {
      setActiveStep(step)
    }
  }, [step])

  return (
    <Stack
      spacing={8}
      padding={8}
      borderRadius="xl"
      bg={'white'}
      boxShadow={'md'}
    >
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
              isDisabled={isLoading || isSigning || isValidating}
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
              isDisabled={isLoading || isSigning || isValidating}
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
              ref={imageInputRef}
              onBlur={handleBlur}
              isDisabled={isLoading || isSigning || isValidating}
            />
            <FormErrorMessage>{errors.image}</FormErrorMessage>
          </FormControl>
          <FormControl
            isRequired
            isInvalid={!!errors.website && touched.website}
          >
            <FormLabel>Website</FormLabel>
            <Input
              id="website"
              type="text"
              placeholder="https://your-metadata.com"
              value={values.website}
              onChange={handleChange}
              onBlur={handleBlur}
              isDisabled={isLoading || isSigning || isValidating}
            />
            <FormErrorMessage>{errors.website}</FormErrorMessage>
          </FormControl>
          <FormControl
            isInvalid={!!errors.mediaChannel && touched.mediaChannel}
          >
            <FormLabel>Media channel</FormLabel>
            <Input
              id="mediaChannel"
              value={values.mediaChannel}
              onChange={handleChange}
              onBlur={handleBlur}
              type="text"
              placeholder="https://your-media-channel.com"
              isDisabled={isLoading || isSigning || isValidating}
            />
            <FormErrorMessage>{errors.mediaChannel}</FormErrorMessage>
          </FormControl>
          <FormControl
            isRequired
            isInvalid={!!errors.magisterBaseKarma && touched.magisterBaseKarma}
          >
            <FormLabel>Magister base karma</FormLabel>
            <NumberInput
              allowMouseWheel
              defaultValue={0}
              min={0}
              id="magisterBaseKarma"
              onChange={(_valueAsString, valueAsNumber) => {
                if (isNaN(valueAsNumber)) {
                  setFieldValue('magisterBaseKarma', 0) // Set to a default value or any other appropriate value
                } else {
                  setFieldValue('magisterBaseKarma', valueAsNumber)
                }
              }}
              value={values.magisterBaseKarma}
              onBlur={handleBlur}
              isDisabled={isLoading || isSigning || isValidating}
            >
              <NumberInputField />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
            <FormErrorMessage>{errors.magisterBaseKarma}</FormErrorMessage>
          </FormControl>
          <FormControl
            isRequired
            isInvalid={
              !!errors.discipulusBaseKarma && touched.discipulusBaseKarma
            }
          >
            <FormLabel>Discipulus base karma</FormLabel>
            <NumberInput
              allowMouseWheel
              defaultValue={0}
              min={0}
              id="discipulusBaseKarma"
              onChange={(_valueAsString, valueAsNumber) => {
                if (isNaN(valueAsNumber)) {
                  setFieldValue('discipulusBaseKarma', 0) // Set to a default value or any other appropriate value
                } else {
                  setFieldValue('discipulusBaseKarma', valueAsNumber)
                }
              }}
              value={values.discipulusBaseKarma}
              onBlur={handleBlur}
              isDisabled={isLoading || isSigning || isValidating}
            >
              <NumberInputField />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
            <FormErrorMessage>{errors.discipulusBaseKarma}</FormErrorMessage>
          </FormControl>
          <FormControl
            isRequired
            isInvalid={
              (!!errors.snapshotSpaceENS && touched.snapshotSpaceENS) ||
              isENSOwner === false
            }
          >
            <FormLabel>Snapshot Space ENS</FormLabel>
            <Input
              id="snapshotSpaceENS"
              value={values.snapshotSpaceENS}
              onChange={handleChange}
              onBlur={handleBlur}
              type="text"
              placeholder="your-ens.eth"
              isDisabled={isLoading || isSigning || isValidating}
            />
            <FormErrorMessage>
              {errors.snapshotSpaceENS ||
                (!isENSOwner && 'You are not the owner of this ENS address.')}
            </FormErrorMessage>
          </FormControl>
          <FormControl
            isRequired
            isInvalid={!!errors.votingStrategy && touched.votingStrategy}
          >
            <FormLabel>Voting strategy</FormLabel>
            <Select
              id="votingStrategy"
              placeholder="Select voting strategy"
              onChange={handleChange}
              defaultValue={'linear-voting'}
              isDisabled={isLoading || isSigning || isValidating}
            >
              <option value={'linear-voting'}>Linear Voting</option>
              <option value={'quadratic-voting'}>Quadratic Voting</option>
            </Select>
            <FormErrorMessage>{errors.votingStrategy}</FormErrorMessage>
          </FormControl>
          <Button
            colorScheme="blue"
            type="submit"
            isLoading={isLoading || isSigning || isValidating}
            loadingText="Submitting"
          >
            Create course
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
      {isLoading || isSigning || isValidating ? (
        <Box>
          <ProgressStepper steps={steps} activeStep={activeStep} />
        </Box>
      ) : (
        <></>
      )}
    </Stack>
  )
}
