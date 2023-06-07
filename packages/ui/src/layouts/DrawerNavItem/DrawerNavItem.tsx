import { FC } from 'react'
import NextLink from 'next/link'
import { Flex, Icon, Link } from '@chakra-ui/react'
import { IconType } from 'react-icons'

export type NavItemProps = {
  icon: IconType
  href: string
  children: string
}

export const NavItem: FC<NavItemProps> = ({
  icon,
  children,
  href,
  ...rest
}) => {
  return (
    <Link
      href={href}
      style={{ textDecoration: 'none' }}
      _focus={{ boxShadow: 'none' }}
      as={NextLink}
    >
      <Flex
        align='center'
        p='4'
        mx='4'
        borderRadius='lg'
        role='group'
        cursor='pointer'
        _hover={{
          bg: 'gray.400',
          color: 'white',
        }}
        {...rest}
      >
        {icon && (
          <Icon
            mr='4'
            fontSize='16'
            _groupHover={{
              color: 'white',
            }}
            as={icon}
          />
        )}
        {children}
      </Flex>
    </Link>
  )
}
