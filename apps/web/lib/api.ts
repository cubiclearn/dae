import {prisma} from '@dae/database'
import type {Course, CourseStudents} from '@dae/database'

export const getCourse = (address: string, chainId: number): Promise<Course | null> => {
  return prisma.course.findFirst({
    where: {
      address: address.toLowerCase(),
      chainId: chainId,
    },
  })
}

export const getCourseStudents = async (address: string, chainId: number): Promise<CourseStudents[]> => {
  return prisma.courseStudents.findMany({
    where: {
      courseAddress: address.toLowerCase(),
      chainId: chainId,
    },
  })
}

export const getTeacherCourses = async (teacherAddress: string, chainId: number): Promise<Course[]> => {
  return prisma.course.findMany({
    where: {
      chainId: chainId,
      owner: teacherAddress.toLowerCase(),
    },
    orderBy: [
      {
        timestamp: 'desc',
      },
    ],
  })
}

export const getStudentCourses = async (studentAddress: string, chainId: number) => {
  const data = await prisma.courseStudents.findMany({
    where: {
      chainId: chainId,
      studentAddress: studentAddress.toLowerCase(),
    },
    include: {
      course: true,
    },
  })

  if (data === null) {
    throw Error('Course does not exist or you have passed the wrong chain')
  }

  const cleanData = data.map((courseStudentsData) => {
    return courseStudentsData.course
  })

  return cleanData
}
