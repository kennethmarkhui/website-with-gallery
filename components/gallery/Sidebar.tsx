import FilterForm from './FilterForm'

interface SidebarProps {
  disabled?: boolean
}

const Sidebar = ({ disabled = false }: SidebarProps): JSX.Element => {
  return (
    <aside className="sticky top-8 hidden h-full shrink-0 basis-1/6 divide-y pt-4 lg:flex lg:flex-col">
      <FilterForm disabled={disabled} />
    </aside>
  )
}

export default Sidebar
