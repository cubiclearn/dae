import { prisma } from '@dae/database'
import type {
  Course,
  UserCredentials,
  Credential,
  CredentialType,
} from '@dae/database'
import { Address } from 'viem'

export const getCourse = (
  address: string,
  chainId: number,
): Promise<Course | null> => {
  return prisma.course.findFirst({
    where: {
      address: address.toLowerCase(),
      chain_id: chainId,
    },
  })
}

export const getCourseStudents = async (
  courseAddress: string,
  chainId: number,
): Promise<UserCredentials[]> => {
  return prisma.userCredentials.findMany({
    where: {
      course_address: courseAddress.toLowerCase(),
      chain_id: chainId,
      credential: {
        type: 'DISCIPULUS',
      },
    },
  })
}

export const getUserCourses = async (
  userAddress: string,
  chainId: number,
  type: CredentialType,
): Promise<Course[]> => {
  return prisma.course.findMany({
    where: {
      chain_id: chainId,
      credentials: {
        some: {
          type,
          user_credentials: {
            some: {
              user_address: userAddress.toLowerCase(),
            },
          },
        },
      },
    },
    orderBy: [
      {
        timestamp: 'desc',
      },
    ],
  })
}

export const getCourseCredentials = async (
  courseAddress: string,
  chainId: number,
): Promise<Credential[]> => {
  return prisma.credential.findMany({
    where: {
      course_address: courseAddress.toLowerCase(),
      course_chain_id: chainId,
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
      course_address: courseAddress.toLowerCase(),
      course_chain_id: chainId,
      user_credentials: {
        some: {
          user_address: userAddress.toLowerCase(),
        },
      },
    },
    orderBy: {
      name: 'asc',
    },
  })
}

export const createCourseCredentials = async (
  courseAddress: Address,
  chainId: number,
  credentialData: Credential,
) => {
  prisma.course.update({
    where: {
      address_chain_id: {
        address: courseAddress.toLowerCase(),
        chain_id: chainId,
      },
    },
    data: {
      credentials: {
        connectOrCreate: {
          where: { id: credentialData.id },
          create: {
            ...credentialData,
          },
        },
      },
    },
    include: {
      credentials: true,
    },
  })
}
