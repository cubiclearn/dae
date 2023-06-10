import { useIsMounted } from '@dae/hooks'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export interface BaseLayoutProps {
  children?: React.ReactNode
}

export function BaseLayout({ children }: BaseLayoutProps): JSX.Element {
  const isMounted = useIsMounted()

  if (isMounted) {
    return <div><>{children}</><ToastContainer /></div>
  }

  return <></>
}
