import { PrismaClient } from '@prisma/client'

declare global {
  var globalPrisma: PrismaClient | undefined
}

export const prisma =
  global.globalPrisma ||
  new PrismaClient({
    log: ['query'],
  })

if (process.env.NODE_ENV !== 'production') global.globalPrisma = prisma

export * from '@prisma/client'
