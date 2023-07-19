import { prisma } from '@dae/database'
import type { Course } from '@dae/database'

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
          user_address: address,
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
          user_address: address,
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
