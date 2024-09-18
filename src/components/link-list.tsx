import { IconType } from 'react-icons'
import { HiExternalLink } from 'react-icons/hi'

import { Link } from '@/i18n/routing'

export interface LinkListProps {
  name: string
  Icon: IconType
  to: string
  newTab?: boolean
}

export default function LinkList({ list }: { list: LinkListProps[] }) {
  return (
    <ul className="my-4 flex flex-wrap">
      {list.map(({ name, Icon, to, newTab = false }, index) => (
        <li key={`${name}-${index}`}>
          <Link
            href={to}
            rel="noreferrer"
            target={newTab ? '_blank' : '_self'}
            className="group relative flex items-center gap-2 p-2 pr-6"
          >
            <Icon />
            {name}
            {newTab && (
              <HiExternalLink className="absolute right-0 hidden opacity-0 group-hover:opacity-100 sm:inline-block" />
            )}
          </Link>
        </li>
      ))}
    </ul>
  )
}
