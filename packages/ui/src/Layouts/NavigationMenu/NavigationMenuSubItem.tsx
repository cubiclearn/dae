import { ListItem, Link } from '@chakra-ui/react'
import NextLink from 'next/link'
import { MenuParams, SubMenuItem } from './types'

interface NavigationMenuSubItemProps {
  subMenuItem: SubMenuItem
  isActive: boolean
  params: MenuParams
}

export const SubMenuItemComponent: React.FC<NavigationMenuSubItemProps> = ({
  subMenuItem,
  params,
  isActive,
}) => {
  return (
    <ListItem px={1} key={subMenuItem.title}>
      <Link
        as={NextLink}
        href={subMenuItem.href(params)}
        _hover={{ textDecoration: 'none' }}
        fontWeight={isActive ? 'bold' : 'normal'}
      >
        {subMenuItem.title}
      </Link>
    </ListItem>
  )
}
