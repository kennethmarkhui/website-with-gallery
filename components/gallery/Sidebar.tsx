import clsx from 'clsx'
import FilterForm from './FilterForm'

interface SidebarProps {
  isOpen: boolean
  close: () => void
}

const Sidebar = ({ isOpen, close }: SidebarProps): JSX.Element => {
  return (
    <>
      <aside
        className={clsx(
          'sticky top-16 z-20 h-[calc(100vh-64px)] w-64 shrink-0 bg-white p-8',
          'transform transition-transform duration-150 ease-in lg:translate-x-0',
          !isOpen && '-translate-x-full'
        )}
      >
        <FilterForm callback={close} />
      </aside>
      {isOpen && (
        <div className="fixed inset-0 z-10 bg-black/25" onClick={close}></div>
      )}
    </>
  )
}

export default Sidebar
