import clsx from 'clsx'
import GalleryHeader from '../layout/header/GalleryHeader'
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
          'sticky top-0 z-40 h-screen w-64 shrink-0 bg-white p-8',
          'transform transition-transform duration-150 ease-in lg:translate-x-0',
          !isOpen && '-translate-x-full'
        )}
      >
        <div className="flex h-full flex-col">
          {!isOpen && <GalleryHeader smallVersion />}
          <FilterForm callback={close} />
        </div>
      </aside>
      {isOpen && (
        <div className="fixed inset-0 z-30 bg-black/25" onClick={close}></div>
      )}
    </>
  )
}

export default Sidebar
