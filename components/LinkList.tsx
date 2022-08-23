import Link from 'next/link'
import { IconType } from 'react-icons'
import { HiExternalLink } from 'react-icons/hi'

export interface ILinkList {
  name: string
  Icon: IconType
  to: string
  newTab?: boolean
}

const LinkList = ({ list }: { list: ILinkList[] }): JSX.Element => (
  <ul className="my-4 flex flex-wrap">
    {list.map(({ name, Icon, to, newTab = false }, index) => (
      <li key={`${name}-${index}`}>
        <Link href={to}>
          <a
            rel="noreferrer"
            target={newTab ? '_blank' : '_self'}
            className="group relative flex items-center gap-2 p-2 pr-6"
          >
            <Icon />
            {name}
            {newTab && (
              <HiExternalLink className="absolute right-0 hidden opacity-0 group-hover:opacity-100 sm:inline-block" />
            )}
          </a>
        </Link>
      </li>
    ))}
  </ul>
)

export default LinkList
