import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  Icon,
  Link,
  ListItem,
  UnorderedList,
} from '@chakra-ui/react'
import { useRouter } from 'next/router'
import React from 'react'
import { IconType } from 'react-icons'
import NextLink from 'next/link'

type NavigationMenuProps = {
  getOpenedAccorditionIndex: (pathname: string) => number | undefined
  children: React.ReactNode
}

export const NavigationMenu: React.FC<NavigationMenuProps> = ({
  getOpenedAccorditionIndex,
  children,
}) => {
  const { pathname } = useRouter()
  return (
    <Accordion allowToggle defaultIndex={getOpenedAccorditionIndex(pathname)}>
      {children}
    </Accordion>
  )
}

type NavigationMenuItemProps = {
  icon: IconType
  isActive?: boolean
  links: { title: string; href: string; active?: boolean }[]
  title: string
}

export const NavigationMenuItem: React.FC<NavigationMenuItemProps> = ({
  icon,
  isActive,
  links,
  title,
}) => {
  if (links.length === 1) {
    return (
      <Link
        href={links[0].href}
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
          _hover={{ ...(!isActive && { bg: 'blackAlpha.50' }) }}
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
            as={icon}
          />
          {title}
        </Box>
      </Link>
    )
  }
  return (
    <AccordionItem border={'none'}>
      <AccordionButton
        display={'flex'}
        justifyContent={'space-between'}
        width={'100%'}
        p="4"
        my="2"
        borderRadius="lg"
        role="group"
        cursor="pointer"
        _hover={{ ...(!isActive && { bg: 'blackAlpha.50' }) }}
        {...(isActive && {
          bg: 'blue.500',
          color: 'white',
        })}
      >
        <Box>
          <Icon
            mr="4"
            fontSize="16"
            {...(isActive && {
              color: 'white',
            })}
            as={icon}
          />
          {title}
        </Box>
        <AccordionIcon />
      </AccordionButton>
      <AccordionPanel p={0} px="4" mx="6" my="1">
        <UnorderedList spacing={3}>
          {links.map((link) => {
            return (
              <ListItem px={1} key={link.title}>
                <Link
                  as={NextLink}
                  href={link.href}
                  _hover={{ textDecoration: 'none' }}
                  fontWeight={link.active ? 'bold' : 'normal'}
                >
                  {link.title}
                </Link>
              </ListItem>
            )
          })}
        </UnorderedList>
      </AccordionPanel>
    </AccordionItem>
  )
}
