import { Role, prisma } from '@dae/database'
import type { Course, CourseStudents } from '@dae/database'

export const getCourse = (
  address: string,
  chainId: number,
): Promise<Course | null> => {
  return prisma.course.findFirst({
    where: {
      address: address.toLowerCase(),
      chainId: chainId,
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
      chainId: chainId,
      roles: {
        some: {
          userAddress: address,
          role: Role.MAGISTER,
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
      chainId: chainId,
      roles: {
        some: {
          userAddress: address,
          role: Role.DISCIPULUS,
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
