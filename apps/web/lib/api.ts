import { prisma } from '@dae/database'
import type {
  Course,
  UserCredentials,
  Credential,
  CredentialType,
  Transactions,
} from '@dae/database'
import { Address } from 'viem'
import { sanitizeAddress } from './functions'

export const getCourse = (
  courseAddress: Address,
  chainId: number,
): Promise<Course | null> => {
  return prisma.course.findUnique({
    where: {
      address_chain_id: {
        address: sanitizeAddress(courseAddress),
        chain_id: chainId,
      },
    },
  })
}

export const getCourseStudents = async (
  courseAddress: Address,
  chainId: number,
): Promise<UserCredentials[]> => {
  return prisma.userCredentials.findMany({
    where: {
      course_address: sanitizeAddress(courseAddress),
      course_chain_id: chainId,
      credential: {
        type: 'DISCIPULUS',
      },
    },
  })
}

export const getCourseTeachers = async (
  courseAddress: Address,
  chainId: number,
): Promise<UserCredentials[]> => {
  return prisma.userCredentials.findMany({
    where: {
      course_address: sanitizeAddress(courseAddress),
      course_chain_id: chainId,
      credential: {
        type: 'MAGISTER',
      },
    },
  })
}

export const getUserCourses = async (
  userAddress: Address,
  chainId: number,
  types: CredentialType[],
  skip?: number,
  limit?: number,
): Promise<
  (UserCredentials & {
    course: { name: string; description: string; image_url: string }
  })[]
> => {
  return prisma.userCredentials.findMany({
    where: {
      user_address: sanitizeAddress(userAddress),
      course_chain_id: chainId,
      credential: {
        type: {
          in: types,
        },
      },
    },
    include: {
      course: {
        select: {
          name: true,
          description: true,
          image_url: true,
        },
      },
    },
    orderBy: {
      course: {
        timestamp: 'desc',
      },
    },
    distinct: ['course_address'],
    take: limit,
    skip: skip,
  })
}

export const getCourseCredentials = async (
  courseAddress: Address,
  chainId: number,
  credentialType: CredentialType | undefined,
): Promise<Credential[]> => {
  return prisma.credential.findMany({
    where: {
      course_address: sanitizeAddress(courseAddress),
      course_chain_id: chainId,
      type: credentialType,
    },
    orderBy: [
      {
        name: 'asc',
      },
    ],
  })
}

export const getUserCourseCredentials = async (
  userAddress: Address,
  courseAddress: Address,
  chainId: number,
): Promise<Credential[]> => {
  return prisma.credential.findMany({
    where: {
      course_address: sanitizeAddress(courseAddress),
      course_chain_id: chainId,
      user_credentials: {
        some: {
          user_address: sanitizeAddress(userAddress),
        },
      },
    },
    orderBy: {
      name: 'asc',
    },
  })
}

export const getCourseUsersCredentials = async (
  credentialCid: string,
  courseAddress: Address,
  chainId: number,
): Promise<UserCredentials[]> => {
  return prisma.userCredentials.findMany({
    where: {
      credential_ipfs_cid: credentialCid,
      course_address: courseAddress,
      course_chain_id: chainId,
    },
  })
}

export const getCourseCredential = async (
  credentialCid: string,
  courseAddress: Address,
  chainId: number,
): Promise<Credential | null> => {
  return prisma.credential.findUnique({
    where: {
      course_address_course_chain_id_ipfs_cid: {
        ipfs_cid: credentialCid,
        course_address: sanitizeAddress(courseAddress),
        course_chain_id: chainId,
      },
    },
  })
}

export const getUserCourseCredential = async (
  credentialCid: string,
  courseAddress: Address,
  chainId: number,
  userAddress: Address,
): Promise<UserCredentials | null> => {
  return prisma.userCredentials.findUnique({
    where: {
      user_address_course_address_credential_ipfs_cid_course_chain_id: {
        credential_ipfs_cid: credentialCid,
        course_address: sanitizeAddress(courseAddress),
        course_chain_id: chainId,
        user_address: sanitizeAddress(userAddress),
      },
    },
  })
}

export const getUserUnverifiedTransactions = async (
  userAddress: Address,
): Promise<Transactions[]> => {
  return prisma.transactions.findMany({
    where: {
      user_address: sanitizeAddress(userAddress),
      verified: false,
    },
  })
}
