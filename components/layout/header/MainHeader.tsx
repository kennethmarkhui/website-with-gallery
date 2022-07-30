import Link from 'next/link'

interface IMainHeader {
  name: string
  path: string
}

const NavItems: IMainHeader[] = [
  {
    name: 'home',
    path: '/',
  },
  { name: 'about', path: '/about' },
]

const MainHeader = (): JSX.Element => {
  return (
    <header className="mx-auto mt-2 mb-0 flex w-full max-w-5xl items-center justify-between">
      <Link href="/">
        <a>Logo</a>
      </Link>
      <button className="sm:hidden">O</button>
      <ul className="hidden sm:flex">
        {NavItems.map((item) => (
          <li className="capitalize" key={item.name}>
            <Link href={item.path}>
              <a>{item.name}</a>
            </Link>
          </li>
        ))}
      </ul>
    </header>
  )
}

export default MainHeader
