import { prisma } from '@dae/database'
import type { Course, Credential } from '@dae/database'
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
  address: string,
  chainId: number,
): Promise<CourseStudents[]> => {
  return prisma.courseStudents.findMany({
    where: {
      courseAddress: address.toLowerCase(),
      chainId: chainId,
    },
  })
}

export const getMagisterCourses = async (
  address: string,
  chainId: number,
): Promise<Course[]> => {
  return prisma.course.findMany({
    where: {
      chain_id: chainId,
      credentials: {
        some: {
          type: 'MAGISTER',
        },
      },
      credentials_assignment: {
        some: {
          user_address: address.toLowerCase(),
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

export const getDiscipulusCourses = async (
  address: string,
  chainId: number,
): Promise<Course[]> => {
  return prisma.course.findMany({
    where: {
      chain_id: chainId,
      credentials: {
        some: {
          type: 'DISCIPULUS',
        },
      },
      credentials_assignment: {
        some: {
          user_address: address.toLowerCase(),
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
      course_credentials: {
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
          where: { ipfs_cid: credentialData.ipfs_cid },
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
