import {
  Icon,
  FlexProps,
  Box,
  Link,
  UnorderedList,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  ListItem,
} from '@chakra-ui/react'
import { IconType } from 'react-icons'
import NextLink from 'next/link'

interface NavItemProps extends FlexProps {
  icon: IconType
  isActive?: boolean
}

export const NavItemSimple = ({
  icon,
  isActive,
  link,
  ...rest
}: NavItemProps & { link: { title: string; href: string } }) => {
  return (
    <Link
      href={link.href}
      style={{ textDecoration: 'none' }}
      _focus={{ boxShadow: 'none' }}
      as={NextLink}
    >
      <Box
        p='4'
        mx='4'
        my='2'
        borderRadius='lg'
        role='group'
        cursor='pointer'
        _hover={{ ...(!isActive && { bg: 'blackAlpha.50' }) }}
        {...(isActive && {
          bg: 'blue.500',
          color: 'white',
        })}
        {...rest}
      >
        {icon && (
          <Icon
            mr='4'
            fontSize='16'
            {...(isActive && {
              color: 'white',
            })}
            as={icon}
          />
        )}
        {link.title}
      </Box>
    </Link>
  )
}

export const NavItemDropdown = ({
  icon,
  isActive,
  links,
  title,
  ...rest
}: NavItemProps & {
  links: { title: string; href: string; active: boolean }[]
  title: string
}) => {
  return (
    <AccordionItem border={'none'}>
      <AccordionButton
        display={'flex'}
        justifyContent={'space-between'}
        width={'85%'}
        p='4'
        mx='4'
        my='2'
        borderRadius='lg'
        role='group'
        cursor='pointer'
        _hover={{ ...(!isActive && { bg: 'blackAlpha.50' }) }}
        {...(isActive && {
          bg: 'blue.500',
          color: 'white',
        })}
      >
        <Box {...rest}>
          {icon && (
            <Icon
              mr='4'
              fontSize='16'
              {...(isActive && {
                color: 'white',
              })}
              as={icon}
            />
          )}
          {title}
        </Box>
        <AccordionIcon />
      </AccordionButton>
      <AccordionPanel p={0} px='4' mx='6' my='1'>
        <UnorderedList spacing={3}>
          {links.map((link) => {
            return (
              <ListItem px={2} key={link.title}>
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
