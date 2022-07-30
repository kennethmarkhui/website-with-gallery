import MainHeader from './header/MainHeader'

type LayoutProps = {
  children: React.ReactNode
}

const Layout = ({ children }: LayoutProps): JSX.Element => {
  return (
    <div>
      <MainHeader />
      <main>{children}</main>
    </div>
  )
}

export default Layout
