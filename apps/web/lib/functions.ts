import { Address } from 'viem'

export const sanitizeAddress = (address: Address) => {
  return address.toLowerCase()
}
