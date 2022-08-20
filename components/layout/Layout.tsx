import MainHeader from './header/MainHeader'

interface ILayout {
  children: React.ReactNode
}

const Layout = ({ children }: ILayout): JSX.Element => {
  return (
    <div className="my-0 mx-auto flex h-screen min-h-full w-full flex-col justify-between overflow-hidden py-4 px-12">
      <MainHeader />
      <main className="m-auto w-full max-w-5xl">{children}</main>
    </div>
  )
}

export default Layout
