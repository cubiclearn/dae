import { useState, useMemo } from 'react'
import { Chain, useContractWrite, usePublicClient } from 'wagmi'
import { normalize } from 'viem/ens'
import { Address } from 'viem'
import { CredentialsFactoryAbi } from '@dae/abi'
import { useCreateSnapshotSpace } from '@dae/snapshot'
import type { Course } from '@dae/database'
import { createPublicClient, http } from 'viem'
import { mainnet, goerli } from 'viem/chains'
import { FactoryContractAddress } from '@dae/chains'

export function useCreateCourse(chain: Chain, address: Address) {
  const [error, setError] = useState<string | null>(null)
  const [isError, setIsError] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSigning, setIsSigning] = useState(false)
  const [step, setStep] = useState<null | number>(null)

  const { create: createSnapshotSpace } = useCreateSnapshotSpace()

  const factoryAddress = FactoryContractAddress[
    chain.id as keyof FactoryContractAddress
  ] as Address

  const { writeAsync } = useContractWrite({
    address: factoryAddress,
    functionName: 'createCourse',
    abi: CredentialsFactoryAbi,
  })

  const publicClient = usePublicClient()

  const ensCheckerPublicClient = useMemo(
    () =>
      createPublicClient({
        chain: chain && !chain.testnet && chain.id !== 31337 ? mainnet : goerli,
        transport: http(),
      }),
    [chain],
  )

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
    setIsSuccess(false)
    setIsError(false)
    setIsSigning(true)
    setIsLoading(true)

    try {
      setStep(0)

      const resolverAddress = await ensCheckerPublicClient.getEnsAddress({
        name: normalize(snapshotSpaceENS),
      })

      if (resolverAddress !== address) {
        throw new Error('You are not the owner of this ENS address.')
      }

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

      if (writeAsync === undefined) {
        throw new Error(
          'The data provided is incorrect. Please ensure that you have entered the correct information.',
        )
      }

      const writeResult = await writeAsync({
        args: [
          name,
          'DAEC',
          `${process.env.NEXT_PUBLIC_IPFS_GATEWAY_URL}/${metadataIPFSHash}`,
          BigInt(100),
          BigInt(magisterBaseKarma),
          BigInt(discipulusBaseKarma),
        ],
      })

      setIsSigning(false)
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

      setIsLoading(false)
      setIsSuccess(true)
    } catch (error: any) {
      setIsLoading(false)
      setIsSigning(false)
      setIsError(true)
      setError(error.message || 'An error occurred')
      throw error
    }
  }

  return {
    create,
    isLoading,
    isError,
    isSuccess,
    error,
    isSigning,
    step,
  }
}
