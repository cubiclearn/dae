export interface CourseMetadata {
    name: string;
    description: string;
    image: string;
    website: string;
    access_url: string;
  }

export type CredentialTransferLog = {eventName : string, args : {from : `0x${string}`, to : `0x${string}`, tokenId : bigint}}