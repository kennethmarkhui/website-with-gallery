import MainHeader from './header/MainHeader'

interface ILayout {
  children: React.ReactNode
}

const Layout = ({ children }: ILayout): JSX.Element => {
  return (
    <div className="my-0 mx-auto flex min-h-screen w-full flex-col justify-between py-4 px-12">
      <MainHeader />
      <main className="m-auto w-full max-w-5xl">{children}</main>
    </div>
  )
}

export default Layout
