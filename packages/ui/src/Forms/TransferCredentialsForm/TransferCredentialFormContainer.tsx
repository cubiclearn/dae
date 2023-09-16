import React from 'react'
import { BaseCredentialsTransferForm } from './BaseCredentialsTransferForms'
import { CredentialsTransferForm } from './CredentialsTransferForms'
import { CredentialType } from '@dae/database'
import { Address } from 'viem'

type TransferCredentialsFormContainerProps = {
  courseAddress: Address
  credentialType: CredentialType
}

export const TransferCredentialsFormContainer: React.FC<
  TransferCredentialsFormContainerProps
> = ({ courseAddress, credentialType }) => {
  if (credentialType === 'MAGISTER' || credentialType === 'DISCIPULUS') {
    return (
      <BaseCredentialsTransferForm
        courseAddress={courseAddress}
        credentialType={credentialType}
      />
    )
  }

  return <CredentialsTransferForm courseAddress={courseAddress} />
}
