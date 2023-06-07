import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { getCsrfToken } from 'next-auth/react'
import { SiweMessage } from 'siwe'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { prisma } from '@dae/database'

// For more information on each option (and a full list of options) go to
// https://next-auth.js.org/configuration/options
export default async function auth(req: any, res: any) {
  const providers = [
    CredentialsProvider({
      name: 'Ethereum',
      credentials: {
        message: {
          label: 'Message',
          type: 'text',
          placeholder: '0x0',
        },
        signature: {
          label: 'Signature',
          type: 'text',
          placeholder: '0x0',
        },
      },
      async authorize(credentials) {
        try {
          const siwe = new SiweMessage(JSON.parse(credentials?.message || '{}'))

          const nextAuthUrl = new URL(process.env.NEXTAUTH_URL!)

          const result = await siwe.verify({
            signature: credentials?.signature || '',
            domain: nextAuthUrl.host,
            nonce: await getCsrfToken({ req }),
          })

          const addressCount = await prisma.account.count({
            where: {
              address: siwe.address,
            },
          })

          if (addressCount === 0) {
            await prisma.account.create({
              data: {
                address: siwe.address,
                name: '',
                surname: '',
              },
            })
          }

          if (result.success) {
            return {
              id: siwe.address,
              name: '',
              surname: '',
            }
          }
          return null
        } catch (e) {
          console.log(e)
          return null
        }
      },
    }),
  ]

  const isDefaultSigninPage =
    req.method === 'GET' && req.query.nextauth.includes('signin')

  // Hide Sign-In with Ethereum from default sign page
  if (isDefaultSigninPage) {
    providers.pop()
  }

  return await NextAuth(req, res, {
    // https://next-auth.js.org/configuration/providers/oauth
    providers,
    adapter: PrismaAdapter(prisma),
    session: {
      strategy: 'jwt',
    },
    secret: process.env.NEXTAUTH_SECRET,
    callbacks: {
      async session({ session, token }: { session: any; token: any }) {
        session.user.address = token.id
        session.user.name = token.name
        session.user.surname = token.surname
        return session
      },
      jwt: async ({ token, user }) => {
        if (user) {
          token.id = user.id
        }
        return token
      },
    },
  })
}
