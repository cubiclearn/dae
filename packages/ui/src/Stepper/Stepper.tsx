import {
  Step,
  StepIndicator,
  StepStatus,
  StepIcon,
  Text,
  StepSeparator,
  Stepper,
  Stack,
} from '@chakra-ui/react'
import { FC } from 'react'

type ProgressStepperProps = {
  steps: { title: string; description: string }[]
  activeStep: number
}

export const ProgressStepper: FC<ProgressStepperProps> = ({
  steps,
  activeStep,
}) => {
  return (
    <Stack>
      <Stepper index={activeStep} size={'sm'}>
        {steps.map((_step, index) => (
          <Step key={index}>
            <StepIndicator>
              <StepStatus complete={<StepIcon />} />
            </StepIndicator>
            <StepSeparator />
          </Step>
        ))}
      </Stepper>
      <Stack spacing={1}>
        <Text>
          Step {activeStep + 1}: <b>{steps[activeStep].title}</b>
        </Text>
        <Text>{steps[activeStep].description}</Text>
      </Stack>
    </Stack>
  )
}
