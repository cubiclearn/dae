import { useContractWrite, useNetwork, usePublicClient } from 'wagmi'
import { Address } from 'viem'
import { CredentialsBurnableAbi, KarmaAccessControlAbiUint64 } from '@dae/abi'
import { Credential, CredentialType } from '@dae/database'
import { useWeb3HookState } from '../useWeb3HookState'
import { ApiResponse } from '@dae/types'
import { CONFIRMATION_BLOCKS } from '@dae/constants'
import { mutate } from 'swr'
import { useEditSnapshotSpace } from '@dae/snapshot'
import { useCourse } from '../api'

export type TransferCredentialsData = {
  address: Address
  email?: string
  discord?: string
}

export function useTransferCredentials({
  courseAddress,
  credentialType,
}: { courseAddress: Address; credentialType: CredentialType }) {
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
  const { data: courseData } = useCourse({ courseAddress })
  const publicClient = usePublicClient()

  const { addModerator } = useEditSnapshotSpace(courseAddress, chain?.id)

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
    if (!courseData?.course || !chain?.id) {
      return
    }

    try {
      state.setValidating()
      if (credentialType === 'OTHER') {
        const hasAccess = await publicClient.readContract({
          address: courseData.course.karma_access_control_address as Address,
          abi: KarmaAccessControlAbiUint64,
          functionName: 'hasAccess',
          args: [userData.address],
        })
        if (!hasAccess) {
          throw new Error(
            'The provided address does not correspond to an enrolled course participant. Credential issuance is restricted to users who possess either a MAGISTER or DISCIPULUS credential.',
          )
        }
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
        throw new Error(responseJSON.message)
      }

      const alreadyExistingCredentialResponseJSON: ApiResponse<{
        credential: Credential
      }> = await alreadyExistingCredentialResponse.json()

      if (alreadyExistingCredentialResponseJSON.data?.credential) {
        throw new Error(
          `Credential already minted to this address (${userData.address}).`,
        )
      }

      state.setSigning()

      const tokenURI = `${process.env.NEXT_PUBLIC_IPFS_GATEWAY_URL}/${credentialIPFSCid}`
      if (mint === undefined) {
        throw new Error(
          'The data provided is incorrect. Please ensure that you have entered the correct information.',
        )
      }

      const writeResult = await mint({
        args: [userData.address, tokenURI, 2],
      })

      await fetch('/api/v0/transactions', {
        method: 'POST',
        body: JSON.stringify({
          txHash: writeResult.hash,
          chainId: publicClient.chain.id,
          action: 'TRANSFER_CREDENTIALS',
        }),
        headers: {
          'Content-type': 'application/json; charset=UTF-8',
        },
      })

      state.setLoading()

      const txReceipt = await publicClient.waitForTransactionReceipt({
        hash: writeResult.hash,
        confirmations: CONFIRMATION_BLOCKS,
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
        throw new Error(responseJSON.message)
      }

      if (credentialType === 'DISCIPULUS') {
        mutate(
          (key) => Array.isArray(key) && key[0] === 'course/students',
          undefined,
          { revalidate: true },
        )
      }

      if (credentialType === 'MAGISTER') {
        await addModerator(userData.address)
        mutate(
          (key) => Array.isArray(key) && key[0] === 'course/teachers',
          undefined,
          { revalidate: true },
        )
      }

      if (credentialType === 'OTHER') {
        mutate(
          (key) => Array.isArray(key) && key[0] === 'course/credential/users',
          undefined,
          { revalidate: true },
        )
      }

      state.setSuccess()
    } catch (e: any) {
      state.handleError(e)
      throw e
    }
  }

  const multiTransfer = async (
    usersData: TransferCredentialsData[],
    credentialIPFSCid: string,
  ): Promise<void> => {
    if (!courseData?.course || !chain?.id) {
      return
    }

    try {
      state.setValidating()
      const tokenURI = `${process.env.NEXT_PUBLIC_IPFS_GATEWAY_URL}/${credentialIPFSCid}`

      if (credentialType === 'OTHER') {
        let accessList: { address: Address; hasAccess: boolean }[]
        if (chain.contracts?.multicall3?.address) {
          // Do a multicall
          const usersHaveAccessList = await publicClient.multicall({
            multicallAddress: chain.contracts.multicall3.address,
            contracts: usersData.map((userData) => ({
              address: courseData.course
                .karma_access_control_address as Address,
              abi: KarmaAccessControlAbiUint64,
              functionName: 'hasAccess',
              args: [userData.address],
            })),
          })
          accessList = usersHaveAccessList.map((hasAccess, index) => {
            return {
              address: usersData[index].address as Address,
              hasAccess: hasAccess.result ?? false,
            }
          })
        } else {
          // Do multiple single calls
          accessList = await Promise.all(
            usersData.map(async (userData) => {
              const hasAccess = await publicClient.readContract({
                address: courseData.course
                  .karma_access_control_address as Address,
                abi: KarmaAccessControlAbiUint64,
                functionName: 'hasAccess',
                args: [userData.address],
              })
              return {
                address: userData.address as Address,
                hasAccess: hasAccess,
              }
            }),
          )
        }

        const addressesWithNoAccess = accessList
          .filter((item) => !item.hasAccess)
          .map((item) => item.address)

        if (addressesWithNoAccess.length > 0) {
          throw new Error(
            `This provided addresses: ${addressesWithNoAccess.join(
              ', ',
            )} do not correspond to an enrolled course participant. Credential issuance is restricted to users who possess either a MAGISTER or DISCIPULUS credential.`,
          )
        }
      }

      await Promise.all(
        usersData.map(async (userData) => {
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
            throw new Error(responseJSON.message)
          }

          const alreadyExistingCredentialResponseJSON: ApiResponse<{
            credential: Credential
          }> = await alreadyExistingCredentialResponse.json()

          if (alreadyExistingCredentialResponseJSON.data?.credential) {
            throw new Error(
              `Credential already minted to this address (${userData.address}). Please remove it from the list and retry.`,
            )
          }

          return null
        }),
      )

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

      await fetch('/api/v0/transactions', {
        method: 'POST',
        body: JSON.stringify({
          txHash: writeResult.hash,
          chainId: publicClient.chain.id,
          action: 'TRANSFER_CREDENTIALS',
        }),
        headers: {
          'Content-type': 'application/json; charset=UTF-8',
        },
      })

      state.setLoading()

      const txReceipt = await publicClient.waitForTransactionReceipt({
        hash: writeResult.hash,
        confirmations: CONFIRMATION_BLOCKS,
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
        throw new Error(responseJSON.message)
      }

      if (credentialType === 'DISCIPULUS') {
        mutate(
          (key) => Array.isArray(key) && key[0] === 'course/students',
          undefined,
          { revalidate: true },
        )
      }

      if (credentialType === 'OTHER') {
        mutate(
          (key) => Array.isArray(key) && key[0] === 'course/credential/users',
          undefined,
          { revalidate: true },
        )
      }

      state.setSuccess()
    } catch (e: any) {
      state.handleError(e)
      throw e
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
