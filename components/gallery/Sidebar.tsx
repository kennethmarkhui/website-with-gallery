import clsx from 'clsx'

interface SidebarProps {
  children: React.ReactNode
  placement?: 'left' | 'right'
  isOpen: boolean
  open?: () => void
  close: () => void
}

const sidebarPlacement = {
  left: '-translate-x-full',
  right: 'translate-x-full',
}

const Sidebar = ({
  children,
  placement = 'left',
  isOpen,
  open,
  close,
}: SidebarProps): JSX.Element => {
  return (
    <>
      <aside
        className={clsx(
          'sticky top-0 z-40 h-[100dvh] w-64 shrink-0 bg-white p-8',
          'transform transition-transform duration-150 ease-in lg:translate-x-0',
          !isOpen && sidebarPlacement[placement]
        )}
      >
        {children}
      </aside>
      {isOpen && (
        <div className="fixed inset-0 z-30 bg-black/25" onClick={close}></div>
      )}
    </>
  )
}

export default Sidebar
