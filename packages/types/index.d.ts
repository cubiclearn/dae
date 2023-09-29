export interface CourseMetadata {
    name: string;
    description: string;
    image: string;
    website: string;
    access_url: string;
  }

export type CredentialTransferLog = {eventName : string, args : {from : `0x${string}`, to : `0x${string}`, tokenId : bigint}}

export type CredentialIssuedLog = {eventName : string, args : {from : `0x${string}`, to : `0x${string}`, tokenId : bigint, burnAuth: bigint}}


export enum ApiResponseStatus {
    "success",
    "fail",
    "error"
}

export type ApiResponse<T> = {
    status: ApiResponseStatus
    data?: T | null
    message?: string
}

export type SWRHook<T> = {
    data: T | undefined
    error: Error | undefined
    isLoading: boolean
    isSuccess: boolean
    isError: boolean
}

export type SWRInfiniteHook<T> = {
    data: T | undefined
    error: Error | undefined
    isLoading: boolean
    isValidating: boolean
    isSuccess: boolean
    isError: boolean
    hasMore: boolean
    size: number
    setSize: (
      size: number | ((_size: number) => number),
    ) => Promise<ApiResponse<T>[] | undefined>
  }

export type UseWeb3WriteHookInterface = {
    isLoading: boolean
    isSuccess: boolean
    isError: boolean
    isValidating: boolean
    isSigning: boolean
    error: Error | null
}

export interface UseWeb3ReadHookInterface<T> {
    isLoading: boolean
    isSuccess: boolean
    isError: boolean
    error: Error | null
    data: T | undefined
}


export type VotingStrategy = "linear-voting" | "quadratic-voting"