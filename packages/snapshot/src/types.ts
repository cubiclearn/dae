export interface SpaceConfig {
  name: string
  skin: 'indexed'
  about: string
  admins: string[]
  moderators: string[]
  avatar: string
  symbol: string
  filters: {
    minScore: number
    onlyMembers: boolean
  }
  network: string
  strategies: {
    name: string
    params: {
      symbol: string
      address: string
      decimals: number
      methodABI: {
        inputs: {
          internalType: string
          name: string
          type: string
        }[]
        name: string
        outputs: {
          internalType: string
          name: string
          type: string
        }[]
        stateMutability: string
        type: string
      }
    }
  }[]
  validation: {
    name: string
    params: {}
  }
}
