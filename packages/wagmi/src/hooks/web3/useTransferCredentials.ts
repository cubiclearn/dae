import { useContractWrite, usePublicClient } from 'wagmi'
import { Address } from 'viem'
import { CredentialsBurnableAbi } from '@dae/abi'
import { CredentialType } from '@dae/database'
import { useWeb3HookState } from '../useWeb3HookState'

export type TransferCredentialsData = {
  address: Address
  email: string
  discord: string
}

export function useTransferCredentials(
  courseAddress: Address,
  credentialType: CredentialType,
) {
  const {
    isSuccess,
    isValidating,
    isLoading,
    isSigning,
    isError,
    error,
    ...state
  } = useWeb3HookState()

  const publicClient = usePublicClient()

  const { writeAsync: mint } = useContractWrite({
    abi: CredentialsBurnableAbi,
    address: courseAddress,
    functionName: credentialType === 'MAGISTER' ? 'mintMagister' : 'mint',
  })

  const { writeAsync: multiMint } = useContractWrite({
    abi: CredentialsBurnableAbi,
    address: courseAddress,
    functionName: 'multiMint',
  })

  const transfer = async (
    userData: TransferCredentialsData,
    credentialIPFSCid: string,
  ): Promise<void> => {
    state.setValidating()

    try {
      const tokenURI = `${process.env.NEXT_PUBLIC_IPFS_GATEWAY_URL}/${credentialIPFSCid}`
      if (mint === undefined) {
        throw new Error(
          'The data provided is incorrect. Please ensure that you have entered the correct information.',
        )
      }

      const checkExistingCredentialSearchParams = new URLSearchParams({
        chainId: publicClient.chain.id.toString(),
        courseAddress: courseAddress,
        userAddress: userData.address,
        credentialCid: credentialIPFSCid,
      })

      const alreadyExistingCredentialResponse = await fetch(
        `/api/v0/user/course/credential?${checkExistingCredentialSearchParams}`,
        {
          method: 'GET',
        },
      )

      if (!alreadyExistingCredentialResponse.ok) {
        const responseJSON = await alreadyExistingCredentialResponse.json()
        throw new Error(responseJSON.error)
      }

      const alreadyExistingCredentialResponseJSON =
        await alreadyExistingCredentialResponse.json()

      if (alreadyExistingCredentialResponseJSON.data.credential) {
        throw new Error(
          `Credential already minted to this address (${userData.address}).`,
        )
      }

      state.setSigning()

      const writeResult = await mint({
        args: [userData.address, tokenURI, 2],
      })

      state.setLoading()

      const txReceipt = await publicClient.waitForTransactionReceipt({
        hash: writeResult.hash,
      })

      const response = await fetch('/api/v0/user/course/credentials', {
        method: 'POST',
        body: JSON.stringify({
          txHash: txReceipt.transactionHash,
          usersData: [
            {
              discord: userData.discord,
              email: userData.email,
              address: userData.address,
            },
          ],
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

      state.setSuccess()
    } catch (error: any) {
      state.handleError(error)
      throw error
    }
  }

  const multiTransfer = async (
    usersData: TransferCredentialsData[],
    credentialIPFSCid: string,
  ): Promise<void> => {
    state.setValidating()

    try {
      const tokenURI = `${process.env.NEXT_PUBLIC_IPFS_GATEWAY_URL}/${credentialIPFSCid}`

      const checkExistingCredentialPromises = usersData.map(
        async (userData) => {
          const checkExistingCredentialSearchParams = new URLSearchParams({
            chainId: publicClient.chain.id.toString(),
            courseAddress: courseAddress,
            userAddress: userData.address,
            credentialCid: credentialIPFSCid,
          })

          const alreadyExistingCredentialResponse = await fetch(
            `/api/v0/user/course/credential?${checkExistingCredentialSearchParams}`,
            {
              method: 'GET',
            },
          )
          if (!alreadyExistingCredentialResponse.ok) {
            const responseJSON = await alreadyExistingCredentialResponse.json()
            throw new Error(responseJSON.error)
          }

          const alreadyExistingCredentialResponseJSON =
            await alreadyExistingCredentialResponse.json()

          if (alreadyExistingCredentialResponseJSON.data.credential) {
            throw new Error(
              `Credential already minted to this address (${userData.address}). Please remove it from the list and retry.`,
            )
          }

          return null
        },
      )

      await Promise.all(checkExistingCredentialPromises)

      if (multiMint === undefined) {
        throw new Error(
          'The data provided is incorrect. Please ensure that you have entered the correct information.',
        )
      }

      const addressToMint = usersData.map((userData) => userData.address)

      state.setSigning()

      const writeResult = await multiMint({
        args: [
          addressToMint,
          Array(addressToMint.length).fill(tokenURI),
          Array(addressToMint.length).fill(2),
        ],
      })

      state.setLoading()

      const txReceipt = await publicClient.waitForTransactionReceipt({
        hash: writeResult.hash,
      })

      const response = await fetch('/api/v0/user/course/credentials', {
        method: 'POST',
        body: JSON.stringify({
          txHash: txReceipt.transactionHash,
          usersData: usersData,
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

      state.setSuccess()
    } catch (error: any) {
      state.handleError(error)
      throw error
    }
  }

  return {
    transfer,
    multiTransfer,
    isLoading,
    isError,
    isSuccess,
    error,
    isSigning,
    isValidating,
  }
}
