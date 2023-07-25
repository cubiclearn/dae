import { mainnet, goerli, optimism, foundry, Chain } from 'viem/chains'

export const getChainFromId: { [id: string]: Chain } = {
  1: mainnet,
  5: goerli,
  10: optimism,
  31337: foundry,
}

export const mapFormDataFieldsToJSON = (keys: string[], values: string[]) => {
  if (keys.length !== values.length) {
    throw new Error('Arrays must have the same length')
  }

  var result = {}

  for (var i = 0; i < keys.length; i++) {
    result[keys[i].toLowerCase()] = values[i]
  }

  return result
}

export const formDataToJson = (formData: FormData) => {
  const formDataJson = {}

  formData.forEach((value, key) => {
    formDataJson[key] = value
  })

  return formDataJson
}
