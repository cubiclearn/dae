export type MenuParams = Record<string, any>

export interface MenuItem {
  title: string
  key: string
  icon: (props: any) => JSX.Element
  isActive: (pathname: string) => boolean
  links: SubMenuItem[]
  visible: (userPermissions: string[]) => boolean
}

export interface SubMenuItem {
  title: string
  href: (params: Record<string, any>) => string
  isActive: (pathname: string) => boolean
  visible: (userPermissions: string[]) => boolean
}
