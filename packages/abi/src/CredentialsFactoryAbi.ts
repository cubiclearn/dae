export const CredentialsFactoryAbi = [
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "creator",
                type: "address",
            },
            {
                indexed: true,
                internalType: "address",
                name: "credentials",
                type: "address",
            },
            {
                indexed: false,
                internalType: "bool",
                name: "burnable",
                type: "bool",
            },
        ],
        name: "CredentialsCreated",
        type: "event",
    },
    {
        inputs: [
            {
                internalType: "string",
                name: "_name",
                type: "string",
            },
            {
                internalType: "string",
                name: "_symbol",
                type: "string",
            },
            {
                internalType: "string",
                name: "_bUri",
                type: "string",
            },
            {
                internalType: "uint256",
                name: "maxSupply",
                type: "uint256",
            },
        ],
        name: "createCredentials",
        outputs: [
            {
                internalType: "address",
                name: "",
                type: "address",
            },
        ],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "string",
                name: "_name",
                type: "string",
            },
            {
                internalType: "string",
                name: "_symbol",
                type: "string",
            },
            {
                internalType: "string",
                name: "_bUri",
                type: "string",
            },
            {
                internalType: "uint256",
                name: "maxSupply",
                type: "uint256",
            },
        ],
        name: "createCredentialsBurnable",
        outputs: [
            {
                internalType: "address",
                name: "",
                type: "address",
            },
        ],
        stateMutability: "nonpayable",
        type: "function",
    },
];
