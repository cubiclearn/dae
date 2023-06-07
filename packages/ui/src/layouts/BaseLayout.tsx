import { useIsMounted } from '@dae/hooks'

export interface BaseLayoutProps {
  children?: React.ReactNode
}

export function BaseLayout({ children }: BaseLayoutProps): JSX.Element {
  const isMounted = useIsMounted()

  if (isMounted) {
    return <div>{children}</div>
  }

  return <></>
}
