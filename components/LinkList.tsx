import { IconType } from 'react-icons'
import { HiExternalLink } from 'react-icons/hi'

export interface ILinkList {
  name: string
  Icon: IconType
  to: string
}

const LinkList = ({ list }: { list: ILinkList[] }): JSX.Element => (
  <ul className="my-4 flex flex-wrap">
    {list.map(({ name, Icon, to }, index) => (
      <li key={`${name}-${index}`}>
        <a
          href={to}
          rel="noreferrer"
          target="_blank"
          className="group flex items-center gap-2 p-2"
        >
          <Icon />
          {name}
          <HiExternalLink className="hidden opacity-0 group-hover:opacity-100 sm:inline-block" />
        </a>
      </li>
    ))}
  </ul>
)

export default LinkList
