import {prisma} from '@dae/database'

export const getCourse = async (address: string, chainId: number) => {
  const data = await prisma.course.findFirst({
    where: {
      address: address.toLowerCase(),
      chainId: chainId,
    },
  })

  if (data === null) {
    throw Error('Course does not exist or you have passed the wrong chain')
  }

  return data
}

export const getCourseStudents = async (address: string, chainId: number) => {
  const data = await prisma.courseStudents.findMany({
    where: {
      courseAddress: address.toLowerCase(),
      chainId: chainId,
    },
  })

  if (data === null) {
    throw Error('Course does not exist or you have passed the wrong chain')
  }

  return data
}

export const getTeacherCourses = async (teacherAddress: string, chainId: number) => {
  const data = await prisma.course.findMany({
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

  if (data === null) {
    throw Error('Course does not exist or you have passed the wrong chain')
  }

  return data
}
