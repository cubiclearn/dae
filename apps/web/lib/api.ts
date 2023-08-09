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
      chain_id: chainId,
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
      chain_id: chainId,
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
                type: 'MAGISTER', // Change this to your role enum value
                user_credentials: {
                  some: {
                    user_address: sanitizeAddress(userAddress),
                  },
                },
              },
              {
                type: 'ADMIN', // Change this to your role enum value
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

export const createCourseCredentials = async (
  courseAddress: Address,
  chainId: number,
  credentialData: Credential,
) => {
  prisma.course.update({
    where: {
      address_chain_id: {
        address: sanitizeAddress(courseAddress),
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
