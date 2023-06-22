import { Link as ChackraLink } from '@chakra-ui/react'
import NextLink from 'next/link'

interface CustomLinkProps {
  href: string
  children: React.ReactNode
  [key: string]: any
}

export const CustomLink: React.FC<CustomLinkProps> = ({
  href,
  children,
  ...rest
}) => {
  return (
    <ChackraLink
      href={href}
      as={NextLink}
      {...rest}
      style={{ textDecoration: 'none' }}
    >
      {children}
    </ChackraLink>
  )
}
