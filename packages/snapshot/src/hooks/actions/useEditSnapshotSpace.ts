import { Address, useAccount } from 'wagmi'
import snapshot from '@snapshot-labs/snapshot.js'
import { useEthersSigner } from './useEthersSigner'
import { ChainSnapshotHub } from '@dae/chains'
import { useSnapshotHookState } from './useSnapshotHookState'
import { useCourseSpace } from '../api'
import { mutate } from 'swr'

export const useEditSnapshotSpace = (
  courseAddress: Address | undefined,
  chainId: number | undefined,
) => {
  const { isSuccess, isValidating, isLoading, isError, error, ...state } =
    useSnapshotHookState()
  const { address } = useAccount()
  const spaceNetwork = chainId as keyof typeof ChainSnapshotHub
  const hub = ChainSnapshotHub[spaceNetwork]
  const snapshotClient = new snapshot.Client712(hub)
  const signer = useEthersSigner()
  const { data } = useCourseSpace(courseAddress, chainId)

  const addModerator = async (moderatorAddress: Address) => {
    state.setValidating()
    try {
      if (!courseAddress || !chainId || !data) {
        throw new Error(
          'The data provided is incorrect. Please ensure that you have entered the correct information.',
        )
      }
      state.setLoading()

      await snapshotClient.space(signer as any, address as string, {
        space: data.space.id,
        settings: JSON.stringify({
          ...data.space,
          id: undefined,
          moderators: [...data.space.moderators, moderatorAddress],
        }),
      })

      mutate(
        (key) => Array.isArray(key) && key[0] === 'course/space',
        undefined,
        { revalidate: true },
      )

      state.setSuccess()
    } catch (e) {
      state.handleError(e)
      throw e
    }
  }

  const removeModerator = async (moderatorAddress: Address) => {
    state.setValidating()
    try {
      if (!courseAddress || !chainId || !data) {
        throw new Error(
          'The data provided is incorrect. Please ensure that you have entered the correct information.',
        )
      }
      state.setLoading()

      await snapshotClient.space(signer as any, address as string, {
        space: data.space.id,
        settings: JSON.stringify({
          ...data.space,
          id: undefined,
          moderators: data.space.moderators.filter(
            (moderator) => moderator !== moderatorAddress,
          ),
        }),
      })

      mutate(
        (key) => Array.isArray(key) && key[0] === 'course/space',
        undefined,
        { revalidate: true },
      )

      state.setSuccess()
    } catch (e) {
      state.handleError(e)
      throw e
    }
  }

  return {
    addModerator,
    removeModerator,
    isLoading,
    isError,
    isSuccess,
    error,
    isValidating,
  }
}
