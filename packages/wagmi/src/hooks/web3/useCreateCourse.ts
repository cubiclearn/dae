import { useState } from 'react'
import { useContractWrite, useNetwork, usePublicClient } from 'wagmi'
import { Address } from 'viem'
import { CredentialsFactoryAbi } from '@dae/abi'
import { useCreateSnapshotSpace } from '@dae/snapshot'
import type { Course } from '@dae/database'
import { ApiResponse, VotingStrategy } from '@dae/types'
import { useWeb3HookState } from '../useWeb3HookState'
import { CONFIRMATION_BLOCKS, ETHEREUM_ENS_REGEX } from '@dae/constants'
import { mutate } from 'swr'
import { IpfsUploadResult } from '@dae/ipfs'
import { useSnapshotPublicClient } from './useSnapshotPublicClient'
import { useChainCredentialsFactoryAddress } from './useChainCredentialsFactoryAddress'

export function useCreateCourse({
  adminAddress,
}: {
  adminAddress: Address | undefined
}) {
  const {
    isSuccess,
    isValidating,
    isLoading,
    isSigning,
    isError,
    error,
    ...state
  } = useWeb3HookState()

  const { chain } = useNetwork()
  const [step, setStep] = useState<number>(0)
  const { create: createSnapshotSpace } = useCreateSnapshotSpace()
  const publicClient = usePublicClient()

  const credentialFactoryAddress = useChainCredentialsFactoryAddress({
    chainId: chain?.id,
  })

  const { writeAsync } = useContractWrite({
    address: credentialFactoryAddress,
    functionName: 'createCourse',
    abi: CredentialsFactoryAbi,
  })

  const snapshotPublicClient = useSnapshotPublicClient({
    courseChainId: chain?.id,
  })

  const create = async (
    name: string,
    description: string,
    image: File,
    website: string,
    mediaChannel: string,
    magisterBaseKarma: number,
    discipulusBaseKarma: number,
    snapshotSpaceENS: string,
    votingStrategy: VotingStrategy,
  ) => {
    try {
      state.setValidating()
      setStep(0)

      if (!chain?.id || !snapshotPublicClient || !credentialFactoryAddress) {
        return
      }

      if (
        !name ||
        !description ||
        !image ||
        !website ||
        !magisterBaseKarma ||
        !discipulusBaseKarma ||
        !snapshotSpaceENS ||
        !votingStrategy
      ) {
        throw new Error('Missing required parameters for creating new course.')
      }

      if (!snapshotSpaceENS.match(ETHEREUM_ENS_REGEX)) {
        throw new Error('Invalid ENS address.')
      }

      const resolverAddress = await snapshotPublicClient.getEnsAddress({
        name: snapshotSpaceENS,
      })

      if (resolverAddress !== adminAddress) {
        throw new Error('You are not the owner of this ENS address.')
      }

      state.setLoading()

      const formData = new FormData()
      formData.append('file', image)
      formData.append('name', name)
      formData.append('description', description)
      formData.append('website', website)
      formData.append('snapshot-ens', snapshotSpaceENS)
      formData.append('media-channel', mediaChannel)

      const uploadMetadataResponse = await fetch('/api/v0/course/metadata', {
        method: 'POST',
        body: formData,
      })

      if (!uploadMetadataResponse.ok) {
        throw new Error('Error uploading course metadata to IPFS')
      }

      setStep(1)

      const uploadMetadataResponseJson =
        (await uploadMetadataResponse.json()) as ApiResponse<{
          metadata: IpfsUploadResult
        }>

      if (
        !uploadMetadataResponseJson ||
        !uploadMetadataResponseJson.data?.metadata.url
      ) {
        throw new Error(
          'There is a problem uploading your metadata. Try again.',
        )
      }
      const metadataResponse = await fetch(
        uploadMetadataResponseJson.data.metadata.url,
      )

      if (!metadataResponse.ok) {
        throw new Error(
          'There is a problem uploading your metadata. Try again.',
        )
      }

      if (writeAsync === undefined) {
        throw new Error(
          'The data provided is incorrect. Please ensure that you have entered the correct information.',
        )
      }

      state.setSigning()

      const writeResult = await writeAsync({
        args: [
          name,
          'DAEC',
          uploadMetadataResponseJson.data.metadata.url,
          BigInt(magisterBaseKarma),
          BigInt(discipulusBaseKarma),
        ],
      })

      await fetch('/api/v0/transactions', {
        method: 'POST',
        body: JSON.stringify({
          txHash: writeResult.hash,
          chainId: chain.id,
          action: 'CREATE_COURSE',
        }),
        headers: {
          'Content-type': 'application/json; charset=UTF-8',
        },
      })

      state.setLoading()
      setStep(2)

      const txReceipt = await publicClient.waitForTransactionReceipt({
        hash: writeResult.hash,
        confirmations: CONFIRMATION_BLOCKS,
      })

      const response = await fetch('/api/v0/course', {
        method: 'POST',
        body: JSON.stringify({
          txHash: txReceipt.transactionHash,
          chainId: chain.id,
        }),
        headers: {
          'Content-type': 'application/json; charset=UTF-8',
        },
      })

      if (!response.ok) {
        const responseJSON = await response.json()
        throw new Error(responseJSON.message)
      }

      const responseData = (await response.json()) as {
        message: string
        data: { course: Course }
      }

      setStep(3)

      await createSnapshotSpace(
        snapshotSpaceENS,
        responseData.data.course.name,
        responseData.data.course.symbol,
        responseData.data.course.description,
        responseData.data.course.image_url,
        responseData.data.course.karma_access_control_address,
        votingStrategy,
      )

      mutate(
        (key) => Array.isArray(key) && key[0] === 'user/courses',
        undefined,
        { revalidate: true },
      )
      setStep(4)
      state.setSuccess()
    } catch (e: unknown) {
      state.handleError(e)
      throw e
    }
  }

  return {
    create,
    isLoading,
    isError,
    isSuccess,
    isValidating,
    error,
    isSigning,
    step,
  }
}
