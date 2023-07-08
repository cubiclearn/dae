import { useState } from 'react'
import {
  mainnet,
  useAccount,
  useContractWrite,
  useNetwork,
  usePrepareContractWrite,
  usePublicClient,
} from 'wagmi'
import { normalize } from 'viem/ens'
import { Address } from 'viem'
import { CredentialsFactoryAbi } from '@dae/abi'
import { z } from 'zod'
import { useCreateSnapshotSpace } from '@dae/snapshot'
import type { Course } from '@dae/database'
import { createPublicClient, http } from 'viem'
import { goerli } from 'viem/chains'

const metadataSchema = z
  .object({
    name: z.string(),
    description: z.string(),
    image: z.string().url(),
    website: z.string().url(),
    access_url: z.string().url(),
  })
  .nonstrict()

export function useCreateCourse(
  isBurnable: boolean,
  name: string,
  symbol: string,
  bUri: string,
  maxSupply: bigint,
  snapshotSpaceENS: string,
) {
  const [error, setError] = useState<string | null>(null)
  const [isError, setIsError] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSigning, setIsSigning] = useState(false)
  const { create: createSnapshotSpace } = useCreateSnapshotSpace()
  const { chain } = useNetwork()
  const { address } = useAccount()

  const { config } = usePrepareContractWrite({
    address: process.env.NEXT_PUBLIC_FACTORY_CONTRACT_ADDRESS as Address,
    functionName: 'createCourse',
    args: [isBurnable, name, symbol, bUri, maxSupply],
    abi: CredentialsFactoryAbi,
    enabled:
      name !== '' && symbol !== '' && bUri !== '' && maxSupply !== BigInt(0),
  })
  const contractWrite = useContractWrite(config)
  const publicClient = usePublicClient()

  const ensCheckerPublicClient = createPublicClient({
    chain: chain && !chain.testnet ? mainnet : goerli,
    transport: http(),
  })

  const create = async () => {
    setIsSuccess(false)
    setIsError(false)
    setIsSigning(true)

    try {
      if (
        name === '' ||
        symbol === '' ||
        bUri === '' ||
        maxSupply === BigInt(0) ||
        snapshotSpaceENS === ''
      ) {
        throw new Error('Please fill in all the required form fields.')
      }

      const resolverAddress = await ensCheckerPublicClient.getEnsAddress({
        name: normalize(snapshotSpaceENS),
      })

      if (resolverAddress !== address) {
        console.log(resolverAddress)
        throw new Error('You are not the owner of this ENS address.')
      }

      const courseMetadata = await fetch(bUri)

      const courseMetadataJson = await courseMetadata.json()
      const metadataValidationResult =
        metadataSchema.safeParse(courseMetadataJson)

      if (!metadataValidationResult.success) {
        throw new Error(
          'The metadata within the MetadataURL is not in the expected format.',
        )
      }

      if (contractWrite.writeAsync === undefined) {
        throw new Error(
          'The data provided is incorrect. Please ensure that you have entered the correct information.',
        )
      }

      const writeResult = await contractWrite.writeAsync!()
      setIsLoading(true)
      setIsSigning(false)

      const txReceipt = await publicClient.waitForTransactionReceipt({
        hash: writeResult.hash,
      })

      const response = await fetch('/api/v0/course', {
        method: 'POST',
        body: JSON.stringify({
          txHash: txReceipt.transactionHash,
          chainId: publicClient.chain.id,
          snapshotSpaceENS: snapshotSpaceENS,
        }),
        headers: {
          'Content-type': 'application/json; charset=UTF-8',
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status} - ${response.statusText}`)
      }

      const responseData = (await response.json()) as {
        message: string
        data: Course
      }

      await createSnapshotSpace(
        snapshotSpaceENS,
        responseData.data.name,
        responseData.data.symbol,
        responseData.data.description,
        responseData.data.karma_access_control_address,
      )

      setIsLoading(false)
      setIsSuccess(true)
    } catch (error: any) {
      setIsLoading(false)
      setIsSigning(false)
      setIsError(true)
      setError(error.message || 'An error occurred')
    }
  }

  return {
    create,
    isLoading,
    isError,
    isSuccess,
    error,
    isSigning,
  }
}
