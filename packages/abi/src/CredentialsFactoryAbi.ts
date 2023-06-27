export const CredentialsFactoryAbi = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'creator',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'karmaAccessControl',
        type: 'address',
      },
    ],
    name: 'KarmaAccessControlCreated',
    type: 'event',
  },
  {
    inputs: [
      {
        internalType: 'bool',
        name: 'isBurnable',
        type: 'bool',
      },
      {
        internalType: 'string',
        name: '_name',
        type: 'string',
      },
      {
        internalType: 'string',
        name: '_symbol',
        type: 'string',
      },
      {
        internalType: 'string',
        name: '_bUri',
        type: 'string',
      },
      {
        internalType: 'uint256',
        name: 'maxSupply',
        type: 'uint256',
      },
    ],
    name: 'createCourse',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const
