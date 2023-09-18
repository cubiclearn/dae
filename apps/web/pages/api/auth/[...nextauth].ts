// Code in this file is based on https://docs.login.xyz/integrations/nextauth.js
// with added process.env.VERCEL_URL detection to support preview deployments
// and with auth option logic extracted into a 'getAuthOptions' function so it
// can be used to get the session server-side with 'getServerSession'
import { IncomingMessage } from 'http'
import { NextApiRequest, NextApiResponse } from 'next'
import NextAuth, { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { getCsrfToken } from 'next-auth/react'
import { SiweMessage } from 'siwe'

import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { prisma } from '@dae/database'

// For more information on each option (and a full list of options) go to
// https://next-auth.js.org/configuration/options

export function getAuthOptions(req: IncomingMessage): NextAuthOptions {
  const providers = [
    CredentialsProvider({
      async authorize(credentials) {
        try {
          const siwe = new SiweMessage(JSON.parse(credentials?.message || '{}'))

          const nextAuthUrl =
            process.env.NEXTAUTH_URL ||
            (process.env.VERCEL_URL
              ? `https://${process.env.VERCEL_URL}`
              : null)
          if (!nextAuthUrl) {
            console.error(
              'We encountered an issue while retrieving the NEXTAUTH_URL of the application. This error may occur because the environment variable is not properly set.',
            )
            return null
          }

          const nextAuthHost = new URL(nextAuthUrl).host
          if (siwe.domain !== nextAuthHost) {
            console.warn(
              `The sign-in request from ${siwe.domain} has been rejected because it does not match the expected ${nextAuthHost} domain.`,
            )
            return null
          }

          if (siwe.nonce !== (await getCsrfToken({ req }))) {
            return null
          }

          await siwe.verify({ signature: credentials?.signature || '' })

          return {
            id: siwe.address,
          }
        } catch (_e) {
          console.log(_e)
          return null
        }
      },
      credentials: {
        message: {
          label: 'Message',
          placeholder: '0x0',
          type: 'text',
        },
        signature: {
          label: 'Signature',
          placeholder: '0x0',
          type: 'text',
        },
      },
      name: 'Ethereum',
    }),
  ]

  return {
    callbacks: {
      async session({ session, token }: { session: any; token: any }) {
        session.user.address = token.id
        return session
      },
      jwt: async ({ token, user }) => {
        if (user) {
          token.id = user.id
        }
        return token
      },
    },
    // https://next-auth.js.org/configuration/providers/oauth
    providers,
    adapter: PrismaAdapter(prisma),
    secret: process.env.NEXTAUTH_SECRET,
    session: {
      strategy: 'jwt',
    },
  }
}

// For more information on each option (and a full list of options) go to
// https://next-auth.js.org/configuration/options
export default async function auth(req: NextApiRequest, res: NextApiResponse) {
  const authOptions = getAuthOptions(req)

  if (!Array.isArray(req.query.nextauth)) {
    res.status(400).send('Bad request')
    return
  }

  const isDefaultSigninPage =
    req.method === 'GET' &&
    req.query.nextauth.find((value) => value === 'signin')

  // Hide Sign-In with Ethereum from default sign page
  if (isDefaultSigninPage) {
    authOptions.providers.pop()
  }

  return await NextAuth(req, res, authOptions)
}
