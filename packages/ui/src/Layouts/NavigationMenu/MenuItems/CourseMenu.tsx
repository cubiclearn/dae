import { MdOutlinePoll } from 'react-icons/md'
import { MenuItem } from '../types'
import {
  FiBookOpen,
  FiCompass,
  FiShield,
  FiTrendingUp,
  FiUsers,
  FiZap,
} from 'react-icons/fi'

export const CourseMenuItems: MenuItem[] = [
  {
    title: 'Info',
    key: 'info',
    icon: FiBookOpen,
    visible: (_userPermissions) => true,
    isActive: (pathname) => pathname.startsWith('/course/[address]/info'),
    links: [
      {
        title: 'Info',
        href: (params) => `/course/${params.courseAddress}/info`,
        visible: (_userPermissions) => true,
        isActive: (pathname) => pathname === '/course/[address]/info',
      },
    ],
  },
  {
    title: 'Dashboard',
    key: 'dashboard',
    icon: FiTrendingUp,
    visible: (_userPermissions) => true,
    isActive: (pathname) => pathname.startsWith('/course/[address]/dashboard'),
    links: [
      {
        title: 'Dashboard',
        href: (params) => `/course/${params.courseAddress}/dashboard`,
        visible: (_userPermissions) => true,
        isActive: (pathname) => pathname === '/course/[address]/dashboard',
      },
    ],
  },
  {
    title: 'Credentials',
    key: 'credentials',
    icon: FiShield,
    visible: (_userPermissions) => true,
    isActive: (pathname) =>
      pathname.startsWith('/course/[address]/credentials'),
    links: [
      {
        title: 'Course Credentials',
        href: (params) => `/course/${params.courseAddress}/credentials/list`,
        visible: (userPermissions) =>
          userPermissions.includes('admin') ||
          userPermissions.includes('magister'),
        isActive: (pathname) =>
          pathname === '/course/[address]/credentials/list' ||
          pathname.startsWith('/course/[address]/credentials/[credentialCid]'),
      },
      {
        title: 'My Credentials',
        href: (params) => `/course/${params.courseAddress}/credentials/granted`,
        visible: (_userPermissions) => true,
        isActive: (pathname) =>
          pathname === '/course/[address]/credentials/granted',
      },
      {
        title: 'Create',
        href: (params) => `/course/${params.courseAddress}/credentials/create`,
        visible: (userPermissions) =>
          userPermissions.includes('admin') ||
          userPermissions.includes('magister'),
        isActive: (pathname) =>
          pathname === '/course/[address]/credentials/create',
      },
      {
        title: 'Transfer',
        href: (params) =>
          `/course/${params.courseAddress}/credentials/transfer`,
        visible: (userPermissions) =>
          userPermissions.includes('admin') ||
          userPermissions.includes('magister'),
        isActive: (pathname) =>
          pathname === '/course/[address]/credentials/transfer',
      },
    ],
  },
  {
    title: 'Teachers',
    key: 'teachers',
    icon: FiCompass,
    visible: (_userPermissions) => true,
    isActive: (pathname) => pathname.startsWith('/course/[address]/teachers'),
    links: [
      {
        title: 'List',
        href: (params) => `/course/${params.courseAddress}/teachers/list`,
        visible: (_userPermissions) => true,
        isActive: (pathname) => pathname === '/course/[address]/teachers/list',
      },
      {
        title: 'Enroll',
        href: (params) => `/course/${params.courseAddress}/teachers/enroll`,
        visible: (userPermissions) => userPermissions.includes('admin'),
        isActive: (pathname) =>
          pathname === '/course/[address]/teachers/enroll',
      },
    ],
  },
  {
    title: 'Students',
    key: 'students',
    icon: FiUsers,
    visible: (_userPermissions) => true,
    isActive: (pathname) => pathname.startsWith('/course/[address]/students'),
    links: [
      {
        title: 'List',
        href: (params) => `/course/${params.courseAddress}/students/list`,
        visible: (_userPermissions) => true,
        isActive: (pathname) => pathname === '/course/[address]/students/list',
      },
      {
        title: 'Enroll',
        href: (params) => `/course/${params.courseAddress}/students/enroll`,
        visible: (userPermissions) =>
          userPermissions.includes('admin') ||
          userPermissions.includes('magister'),
        isActive: (pathname) =>
          pathname === '/course/[address]/students/enroll',
      },
    ],
  },
  {
    title: 'Karma',
    key: 'karma',
    icon: FiZap,
    visible: (userPermissions) =>
      userPermissions.includes('admin') || userPermissions.includes('magister'),
    isActive: (pathname) => pathname.startsWith('/course/[address]/karma'),
    links: [
      {
        title: 'Transfer',
        href: (params) => `/course/${params.courseAddress}/karma/transfer`,
        visible: (userPermissions) =>
          userPermissions.includes('admin') ||
          userPermissions.includes('magister'),
        isActive: (pathname) => pathname === '/course/[address]/karma/transfer',
      },
    ],
  },
  {
    title: 'Proposals',
    key: 'proposals',
    icon: MdOutlinePoll,
    visible: (_userPermissions) => true,
    isActive: (pathname) => pathname.startsWith('/course/[address]/proposals'),
    links: [
      {
        title: 'Create',
        href: (params) => `/course/${params.courseAddress}/proposals/create`,
        visible: (userPermissions) =>
          userPermissions.includes('admin') ||
          userPermissions.includes('magister'),
        isActive: (pathname) =>
          pathname === '/course/[address]/proposals/create',
      },
      {
        title: 'Explore',
        href: (params) =>
          `/course/${params.courseAddress}/proposals/explore?status=active`,
        visible: (_userPermissions) => true,
        isActive: (pathname) =>
          pathname === '/course/[address]/proposals/explore' ||
          pathname === '/course/[address]/proposals/[proposalId]',
      },
    ],
  },
]
