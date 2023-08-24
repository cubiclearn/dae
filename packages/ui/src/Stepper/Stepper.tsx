import {
  Step,
  StepIndicator,
  StepStatus,
  StepIcon,
  StepNumber,
  Box,
  StepTitle,
  StepDescription,
  StepSeparator,
  Stepper,
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
    <Stepper index={activeStep} size={'sm'}>
      {steps.map((step, index) => (
        <Step key={index}>
          <StepIndicator>
            <StepStatus
              complete={<StepIcon />}
              incomplete={<StepNumber />}
              active={<StepNumber />}
            />
          </StepIndicator>

          <Box flexShrink='0'>
            <StepTitle>{step.title}</StepTitle>
            <StepDescription>{step.description}</StepDescription>
          </Box>

          <StepSeparator />
        </Step>
      ))}
    </Stepper>
  )
}
