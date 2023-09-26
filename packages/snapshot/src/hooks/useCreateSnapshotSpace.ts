import { Address, useAccount, useNetwork } from 'wagmi'
import snapshot from '@snapshot-labs/snapshot.js'
import { useEthersSigner } from './useEthersSigner'
import { ChainSnapshotHub } from '@dae/chains'
import { type VotingStrategy } from '@dae/types'
import { useHookState } from './useHookState'

const buildSpaceSettings = (
  ownerAddress: Address,
  spaceName: string,
  spaceSymbol: string,
  spaceDescription: string,
  chainId: string,
  karmaAccessControlAddress: Address,
  votingStrategy: VotingStrategy,
) => {
  return JSON.stringify({
    name: spaceName,
    skin: 'indexed',
    about: spaceDescription,
    admins: [ownerAddress],
    avatar:
      'https://pbs.twimg.com/profile_images/1431587138202701826/lpgblc4h_400x400.jpg',
    symbol: spaceSymbol,
    filters: {
      minScore: 1,
      onlyMembers: true,
    },
    network: chainId,
    strategies: [
      {
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
              votingStrategy === 'linear-voting'
                ? 'ratingOf'
                : 'quadraticRatingOf',
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
      },
    ],
    validation: {
      name: 'basic',
      params: {},
    },
  })
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

      const spaceSettings = buildSpaceSettings(
        address as Address,
        spaceName,
        spaceSymbol,
        spaceDescription,
        chain.id.toString(),
        karmaAccessControlAddress as Address,
        votingStrategy,
      )
      await snapshotClient.space(signer as any, address as string, {
        space: snapshotSpaceENS,
        settings: spaceSettings,
      })
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
