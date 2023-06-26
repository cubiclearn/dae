import NextLink from 'next/link'
import { Flex, Icon, Link, FlexProps } from '@chakra-ui/react'
import { IconType } from 'react-icons'

interface NavItemProps extends FlexProps {
  icon: IconType
  href: string
  children: string
  isActive?: boolean
}
export const NavItem = ({
  icon,
  children,
  href,
  isActive,
  ...rest
}: NavItemProps) => {
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
        my='2'
        borderRadius='lg'
        role='group'
        cursor='pointer'
        _hover={{
          bg: 'gray.400',
          color: 'white',
        }}
        {...(isActive && {
          bg: 'gray.400',
          color: 'white',
        })}
        {...rest}
      >
        {icon && (
          <Icon
            mr='4'
            fontSize='16'
            _groupHover={{
              color: 'white',
            }}
            {...(isActive && {
              color: 'white',
            })}
            as={icon}
          />
        )}
        {children}
      </Flex>
    </Link>
  )
}
