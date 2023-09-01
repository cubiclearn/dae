import { prisma } from '@dae/database'
import type { Course, UserCredentials, Credential } from '@dae/database'
import { Address } from 'viem'
import { sanitizeAddress } from './functions'

export const getCourse = (
  courseAddress: Address,
  chainId: number,
): Promise<Course | null> => {
  return prisma.course.findFirst({
    where: {
      address: sanitizeAddress(courseAddress),
      chain_id: chainId,
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
  type: 'EDUCATOR' | 'DISCIPULUS',
): Promise<Course[]> => {
  if (type === 'DISCIPULUS') {
    return prisma.course.findMany({
      where: {
        chain_id: chainId,
        credentials: {
          some: {
            type,
            user_credentials: {
              some: {
                user_address: sanitizeAddress(userAddress),
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
  } else {
    return prisma.course.findMany({
      where: {
        chain_id: chainId,
        credentials: {
          some: {
            OR: [
              {
                type: 'MAGISTER',
                user_credentials: {
                  some: {
                    user_address: sanitizeAddress(userAddress),
                  },
                },
              },
              {
                type: 'ADMIN',
                user_credentials: {
                  some: {
                    user_address: sanitizeAddress(userAddress),
                  },
                },
              },
            ],
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
}

export const getCourseCredentials = async (
  courseAddress: Address,
  chainId: number,
): Promise<Credential[]> => {
  return prisma.credential.findMany({
    where: {
      course_address: sanitizeAddress(courseAddress),
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

export const getCourseCredentialUsers = async (
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
