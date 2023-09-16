import { useState } from 'react'
import { Chain, useContractWrite, usePublicClient } from 'wagmi'
import { Address } from 'viem'
import { CredentialsFactoryAbi } from '@dae/abi'
import { useCreateSnapshotSpace } from '@dae/snapshot'
import type { Course } from '@dae/database'
import { mainnet, goerli } from 'viem/chains'
import { FactoryContractAddress } from '@dae/chains'
import { UseWeb3WriteHookInterface } from '@dae/types'
import { useWeb3HookState } from '../useWeb3HookState'

interface CreateCredentialHookInterface extends UseWeb3WriteHookInterface {
  create: (
    name: string,
    description: string,
    image: File,
    website: string,
    mediaChannel: string,
    magisterBaseKarma: number,
    discipulusBaseKarma: number,
    snapshotSpaceENS: string,
  ) => Promise<void>
  step: number
}

export function useCreateCourse(
  chain: Chain | undefined,
  creatorAddress: Address | undefined,
): CreateCredentialHookInterface {
  const {
    isSuccess,
    isValidating,
    isLoading,
    isSigning,
    isError,
    error,
    ...state
  } = useWeb3HookState()

  const [step, setStep] = useState<number>(0)
  const { create: createSnapshotSpace } = useCreateSnapshotSpace()

  const factoryAddress = chain
    ? (FactoryContractAddress[
        chain.id as keyof FactoryContractAddress
      ] as Address)
    : undefined

  const { writeAsync } = useContractWrite({
    address: factoryAddress,
    functionName: 'createCourse',
    abi: CredentialsFactoryAbi,
  })

  const publicClient = usePublicClient()

  const ENSChainId =
    chain && !chain.testnet && chain.id !== 31337 ? mainnet.id : goerli.id

  const ENSPublicClient = usePublicClient({
    chainId: ENSChainId,
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
  ) => {
    try {
      state.setValidating()
      setStep(0)

      if (!snapshotSpaceENS.match(/^([a-z0-9-]+\.eth)$/i)) {
        throw new Error('Invalid ENS address.')
      }

      const resolverAddress = await ENSPublicClient.getEnsAddress({
        name: snapshotSpaceENS,
      })

      if (resolverAddress !== creatorAddress) {
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

      const { Hash: metadataIPFSHash } = await uploadMetadataResponse.json()

      const metadataBaseURI = `${process.env.NEXT_PUBLIC_IPFS_GATEWAY_URL}/${metadataIPFSHash}`

      const metadataResponse = await fetch(metadataBaseURI)

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
          metadataBaseURI,
          BigInt(magisterBaseKarma),
          BigInt(discipulusBaseKarma),
        ],
      })

      state.setLoading()
      setStep(2)

      const txReceipt = await publicClient.waitForTransactionReceipt({
        hash: writeResult.hash,
      })

      const response = await fetch('/api/v0/course', {
        method: 'POST',
        body: JSON.stringify({
          txHash: txReceipt.transactionHash,
          chainId: publicClient.chain.id,
        }),
        headers: {
          'Content-type': 'application/json; charset=UTF-8',
        },
      })

      if (!response.ok) {
        const responseJSON = await response.json()
        throw new Error(responseJSON.error)
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
        responseData.data.course.karma_access_control_address,
      )

      setStep(4)
      state.setSuccess()
    } catch (error: any) {
      state.handleError(error)
      throw error
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
