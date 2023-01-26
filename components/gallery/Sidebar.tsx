import FilterForm from './FilterForm'

interface SidebarProps {
  disabled?: boolean
}

const Sidebar = ({ disabled = false }: SidebarProps): JSX.Element => {
  return (
    <aside className="sticky top-8 hidden max-h-[85vh] shrink-0 basis-1/6 pt-2 lg:flex lg:flex-col">
      <FilterForm disabled={disabled} />
    </aside>
  )
}

export default Sidebar
