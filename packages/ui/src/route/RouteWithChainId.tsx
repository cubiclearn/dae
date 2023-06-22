import { Link } from '@chakra-ui/react'
import { useNetwork } from 'wagmi'
import { DefaultChain } from '@dae/chains'
import NextLink from 'next/link'

interface RouteWithChainProps {
  href: string
  params?: Record<string, string>
  children: React.ReactNode
  [key: string]: any
}

export const RouteWithChainId: React.FC<RouteWithChainProps> = ({
  href,
  params = {},
  children,
  ...rest
}) => {
  const { chain } = useNetwork()
  const chainId = chain?.id || DefaultChain.id

  // Clean href from params
  const cleanedHref = Object.entries(params).reduce((acc, [key, value]) => {
    return acc.replace(`:${key}`, value)
  }, href)

  // Filter out "chainId" parameter from params
  const filteredParams = Object.entries(params).reduce<Record<string, string>>(
    (acc, [key, value]) => {
      if (key !== 'chainId') {
        acc[key] = value
      }
      return acc
    },
    {},
  )

  // Append the chainId and additional parameters to the URL
  const queryParams = new URLSearchParams({
    ...filteredParams,
    chainId: chainId.toString(),
  }).toString()
  const updatedHref = `${cleanedHref}?${queryParams}`

  return (
    <Link href={updatedHref} as={NextLink} {...rest}>
      {children}
    </Link>
  )
}
