import {useAccount} from 'wagmi'
import snapshot from '@snapshot-labs/snapshot.js'
import {useEthersSigner} from './useEthersSigner'

export const useCreateSnapshotSpace = () => {
  const {address} = useAccount()
  const hub = 'https://testnet.snapshot.org'
  const snapshotClient = new snapshot.Client712(hub)
  const signer = useEthersSigner()
  //const provider = new providers.Web3Provider(publicClient.transport)

  const create = async () => {
    const spaceSettings = JSON.stringify({
      name: 'Loot Owners',
      skin: 'indexed',
      about: '',
      admins: ['0x91288986FFaa5F604C14E8df3968cd594AB6150C'],
      avatar: 'https://pbs.twimg.com/profile_images/1431587138202701826/lpgblc4h_400x400.jpg',
      github: 'lootproject',
      symbol: 'LOOT',
      filters: {
        minScore: 1,
        onlyMembers: false,
      },
      members: [],
      network: '1',
      plugins: {},
      twitter: 'lootproject',
      strategies: [
        {
          name: 'erc721',
          params: {
            symbol: 'LOOT',
            address: '0xff9c1b15b16263c61d017ee9f65c50e4ae0113d7',
          },
        },
      ],
      validation: {
        name: 'basic',
        params: {},
      },
    })

    try {
      const receipt = await snapshotClient.space(signer as any, address as string, {
        space: 'ndrew.eth',
        settings: spaceSettings,
      })

      console.log(receipt)
    } catch (_e) {
      console.log(_e)
    }
  }

  return {
    create,
  }
}
