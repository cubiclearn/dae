import { Address, useAccount, useNetwork } from 'wagmi'
import snapshot from '@snapshot-labs/snapshot.js'
import { useEthersSigner } from './useEthersSigner'
import { ChainSnapshotHub } from '@dae/chains'
import { type VotingStrategy } from '@dae/types'
import { useHookState } from './useHookState'
import { SpaceConfig } from '../../types'
import { mutate } from 'swr'

const defaultConfig: SpaceConfig = {
  name: '',
  skin: 'indexed',
  about: '',
  admins: [],
  moderators: [],
  avatar: 'https://cdn.stamp.fyi/space/default.eth?s=160',
  symbol: '',
  filters: {
    minScore: 1,
    onlyMembers: true,
  },
  network: '1',
  strategies: [],
  validation: {
    name: 'basic',
    params: {},
  },
}

const buildStrategyConfiguration = (
  karmaAccessControlAddress: string,
  votingStrategy: VotingStrategy,
) => {
  return {
    name: 'contract-call',
    params: {
      symbol: 'Karma',
      address: karmaAccessControlAddress,
      decimals: 0,
      methodABI: {
        inputs: [
          {
            internalType: 'address',
            name: '_user',
            type: 'address',
          },
        ],
        name:
          votingStrategy === 'linear-voting' ? 'ratingOf' : 'quadraticRatingOf',
        outputs: [
          {
            internalType: 'uint64',
            name: '',
            type: 'uint64',
          },
        ],
        stateMutability: 'view',
        type: 'function',
      },
    },
  }
}

const editSpaceConfig = (
  defaultConfig: SpaceConfig,
  edits: Partial<SpaceConfig>,
): SpaceConfig => {
  return {
    ...defaultConfig,
    ...edits,
    filters: {
      ...defaultConfig.filters,
      ...(edits.filters || {}),
    },
    strategies: [...defaultConfig.strategies, ...(edits.strategies || [])],
  }
}

export const useCreateSnapshotSpace = () => {
  const { address } = useAccount()
  const { chain } = useNetwork()
  const { isSuccess, isValidating, isLoading, isError, error, ...state } =
    useHookState()

  const spaceNetwork = chain!.id as keyof typeof ChainSnapshotHub
  const hub = ChainSnapshotHub[spaceNetwork]
  const snapshotClient = new snapshot.Client712(hub)
  const signer = useEthersSigner()

  const create = async (
    snapshotSpaceENS: string,
    spaceName: string,
    spaceSymbol: string,
    spaceDescription: string,
    spaceImageUrl: string,
    karmaAccessControlAddress: string,
    votingStrategy: VotingStrategy,
  ) => {
    state.setValidating()
    try {
      if (!chain) {
        throw new Error(
          'The data provided is incorrect. Please ensure that you have entered the correct information.',
        )
      }
      state.setLoading()

      const strategySettings = buildStrategyConfiguration(
        karmaAccessControlAddress,
        votingStrategy,
      )

      const spaceSettings: SpaceConfig = editSpaceConfig(defaultConfig, {
        name: spaceName,
        avatar: spaceImageUrl,
        symbol: spaceSymbol,
        about: spaceDescription,
        admins: [address as Address],
        strategies: [strategySettings],
        network: chain.id.toString(),
      })

      await snapshotClient.space(signer as any, address as string, {
        space: snapshotSpaceENS,
        settings: JSON.stringify(spaceSettings),
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
    create,
    isLoading,
    isError,
    isSuccess,
    error,
    isValidating,
  }
}
