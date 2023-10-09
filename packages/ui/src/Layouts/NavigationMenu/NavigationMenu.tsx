import React from 'react'
import { Accordion, Skeleton, Stack } from '@chakra-ui/react'
import { MenuItem, MenuParams } from './types'
import { NavigationMenuItem } from './NavigationMenuItem'
import { useRouter } from 'next/router'

interface NavigationMenuProps {
  menuItems: MenuItem[]
  userPermissions?: string[]
  params?: MenuParams
  isLoading?: boolean
}

const NavigationMenu: React.FC<NavigationMenuProps> = ({
  menuItems,
  userPermissions = [],
  params = {},
  isLoading = false,
}) => {
  const { pathname } = useRouter()
  const activeIndex = menuItems
    .filter((menuItem) => menuItem.links.length >= 2)
    .findIndex(
      (menuItem) =>
        menuItem.isActive(pathname) && menuItem.visible(userPermissions),
    )

  if (isLoading) {
    return (
      <Stack spacing={2} mt={2}>
        {menuItems.map((_, index) => (
          <Skeleton
            key={index}
            height={'56px'}
            isLoaded={false}
            rounded={'lg'}
          />
        ))}
      </Stack>
    )
  }

  return (
    <Accordion allowToggle defaultIndex={activeIndex}>
      {menuItems.map((menuItem: MenuItem) => (
        <NavigationMenuItem
          key={menuItem.key}
          menuItem={menuItem}
          isActive={menuItem.isActive(pathname)}
          params={params}
          userPermissions={userPermissions}
          pathname={pathname}
        />
      ))}
    </Accordion>
  )
}

export const renderNavigationMenu: React.FC<NavigationMenuProps> =
  NavigationMenu
