import { useIsMounted } from '@dae/hooks'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { Inter } from 'next/font/google'

export interface BaseLayoutProps {
  children?: React.ReactNode
}

const inter = Inter({ subsets: ['latin'] })

export function BaseLayout({ children }: BaseLayoutProps): JSX.Element {
  const isMounted = useIsMounted()

  if (isMounted) {
    return (
      <div className={inter.className}>
        {children}
        <ToastContainer />
      </div>
    )
  }

  return <></>
}
