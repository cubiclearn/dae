import {
  AccordionItem,
  Link,
  Box,
  Icon,
  AccordionButton,
  AccordionIcon,
  AccordionPanel,
  UnorderedList,
} from '@chakra-ui/react'
import NextLink from 'next/link'
import { MenuItem, MenuParams, SubMenuItem } from './types'
import { SubMenuItemComponent } from './NavigationMenuSubItem'

interface NavigationMenuItemProps {
  menuItem: MenuItem
  isActive: boolean
  userPermissions: string[]
  pathname: string
  params: MenuParams
}

export const NavigationMenuItem: React.FC<NavigationMenuItemProps> = ({
  menuItem,
  isActive,
  userPermissions,
  pathname,
  params,
}) => {
  if (!menuItem.visible(userPermissions)) {
    return null
  }

  if (menuItem.links.length === 1) {
    return (
      <AccordionItem border="none" key={menuItem.key}>
        <Link
          href={menuItem.links[0].href(params)}
          style={{ textDecoration: 'none' }}
          _focus={{ boxShadow: 'none' }}
          as={NextLink}
        >
          <Box
            p="4"
            my="2"
            borderRadius="lg"
            role="group"
            cursor="pointer"
            width={'100%'}
            _hover={{
              ...(!isActive && { bg: 'blackAlpha.50' }),
            }}
            {...(isActive && {
              bg: 'blue.500',
              color: 'white',
            })}
          >
            <Icon
              mr="4"
              fontSize="16"
              {...(isActive && {
                color: 'white',
              })}
              as={menuItem.icon}
            />
            {menuItem.title}
          </Box>
        </Link>
      </AccordionItem>
    )
  }

  return (
    <AccordionItem border="none" key={menuItem.key}>
      <AccordionButton
        display="flex"
        justifyContent="space-between"
        width="100%"
        p="4"
        my="2"
        borderRadius="lg"
        role="group"
        cursor="pointer"
        bg={isActive ? 'blue.500' : 'transparent'}
        color={isActive ? 'white' : 'black'}
        _hover={{
          ...(!isActive && { bg: 'blackAlpha.50' }),
        }}
      >
        <Box>
          <Icon
            mr="4"
            fontSize="16"
            {...(isActive && {
              color: 'white',
            })}
            as={menuItem.icon}
          />
          {menuItem.title}
        </Box>
        <AccordionIcon />
      </AccordionButton>
      <AccordionPanel p={0} px="2" mx="6" my="1">
        <UnorderedList spacing={3}>
          {menuItem.links.map((link: SubMenuItem) => {
            if (!link.visible(userPermissions)) {
              return null
            }
            return (
              <SubMenuItemComponent
                key={link.title}
                subMenuItem={link}
                params={params}
                isActive={link.isActive(pathname)}
              />
            )
          })}
        </UnorderedList>
      </AccordionPanel>
    </AccordionItem>
  )
}
