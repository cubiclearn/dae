import { MenuItem } from '../types'
import { FiBook } from 'react-icons/fi'

export const ProfileMenuItems: MenuItem[] = [
  {
    title: 'My Courses',
    key: 'my-courses',
    icon: FiBook,
    visible: (_userPermissions) => true,
    isActive: (pathname) => pathname.startsWith('/profile/courses'),
    links: [
      {
        title: 'Create',
        href: (_params) => '/profile/courses/create',
        visible: (_userPermissions) => true,
        isActive: (pathname) => pathname.startsWith('/profile/courses/create'),
      },
      {
        title: 'Teaching',
        href: (_params) => '/profile/courses/teaching',
        visible: (_userPermissions) => true,
        isActive: (pathname) =>
          pathname.startsWith('/profile/courses/teaching'),
      },
      {
        title: 'Partecipating',
        href: (_params) => '/profile/courses/partecipating',
        visible: (_userPermissions) => true,
        isActive: (pathname) =>
          pathname.startsWith('/profile/courses/partecipating'),
      },
    ],
  },
]
