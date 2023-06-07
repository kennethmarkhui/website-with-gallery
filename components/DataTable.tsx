import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
  functionalUpdate,
  Table,
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  PaginationState,
} from '@tanstack/react-table'
import { HiChevronLeft, HiChevronRight } from 'react-icons/hi'

import { cn } from 'lib/utils'
import { GALLERY_LIMIT } from 'constants/gallery'

interface PaginationProps {
  currentPage: number
  totalCount: number
  totalPage: number
  setPageIndex: (index: number) => void
  previousPage: () => void
  nextPage: () => void
  hasPreviousPage: boolean
  hasNextPage: boolean
}

interface FilterProps {
  id: string
  data: { id: string; name: string }[]
}

interface DataTableColumnFiltersProps<TData> {
  state: ColumnFiltersState
  onColumnFiltersChange: (columnFiltersState: ColumnFiltersState) => void
  filters: FilterProps[]
  render?: (table: Table<TData>) => React.ReactNode
}

interface DataTableSortingProps {
  state: SortingState
  onSortingChange: (sortingState: SortingState) => void
}

export interface DataTablePaginationProps {
  state: PaginationState
  dataCount: number
  onPaginationChange: (paginationState: PaginationState) => void
}

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  manualFiltering?: DataTableColumnFiltersProps<TData>
  manualSorting?: DataTableSortingProps
  manualPagination?: DataTablePaginationProps
  isLoading: boolean
}

const Pagination = ({
  currentPage,
  totalCount,
  totalPage,
  setPageIndex,
  previousPage,
  nextPage,
  hasPreviousPage,
  hasNextPage,
}: PaginationProps): JSX.Element => {
  const pageRangeDisplayed = 2
  const marginPagesDisplayed = 1

  const pages: number[] = []
  if (totalPage <= pageRangeDisplayed) {
    for (let index = 1; index <= totalPage; index++) {
      pages.push(index)
    }
  } else {
    // paginate logic from react-paginate's paginate function
    // https://github.com/AdeleD/react-paginate/blob/master/react_components/PaginationBoxView.js
    let leftSide = pageRangeDisplayed / 2
    let rightSide = pageRangeDisplayed - leftSide

    if (currentPage > totalPage - pageRangeDisplayed / 2) {
      rightSide = totalPage - currentPage
      leftSide = pageRangeDisplayed - rightSide
    } else if (currentPage < pageRangeDisplayed / 2) {
      leftSide = currentPage
      rightSide = pageRangeDisplayed - leftSide
    }

    for (let page = 1; page <= totalPage; page++) {
      if (page <= marginPagesDisplayed) {
        pages.push(page)
        continue
      }

      if (page > totalPage - marginPagesDisplayed) {
        pages.push(page)
        continue
      }

      const adjustedRightSide =
        currentPage === 0 && pageRangeDisplayed > 1 ? rightSide - 1 : rightSide

      if (
        page >= currentPage - leftSide &&
        page <= currentPage + adjustedRightSide
      ) {
        pages.push(page)
        continue
      }

      if (
        pages.length > 0 &&
        !isNaN(pages[pages.length - 1]) &&
        (pageRangeDisplayed > 0 || marginPagesDisplayed > 0)
      ) {
        pages.push(NaN)
      }
    }

    pages.forEach((page, i) => {
      const pageBefore = pages[i - 1]
      const pageAfter = pages[i + 1]

      if (
        isNaN(page) &&
        pageBefore &&
        !isNaN(pageBefore) &&
        pageAfter &&
        !isNaN(pageAfter) &&
        pageAfter - pageBefore <= 2
      ) {
        page = (pageAfter + pageBefore) / 2
      }
      pages[i] = page
    })
  }

  return (
    <nav className="flex flex-col items-center justify-center space-y-3 p-4 md:flex-row md:justify-between md:space-y-0">
      <p className="text-sm">
        Total Items: <span className="font-semibold">{totalCount}</span>
      </p>
      <ul className="inline-flex -space-x-px">
        <li>
          <button
            className={cn(
              'flex h-full items-center justify-center rounded-l-lg border border-gray-300 bg-white px-3 py-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-700',
              !hasPreviousPage && 'pointer-events-none'
            )}
            onClick={previousPage}
            disabled={!hasPreviousPage}
          >
            <span className="sr-only">Previous</span>
            <HiChevronLeft />
          </button>
        </li>
        {pages.map((page, idx) => {
          const disabled = currentPage === page || isNaN(page)
          return (
            <li key={idx}>
              <button
                className={cn(
                  'flex items-center justify-center border border-gray-300 px-3 py-2 text-sm leading-tight text-gray-600 hover:bg-gray-100 hover:text-gray-700',
                  disabled
                    ? 'pointer-events-none bg-gray-50 text-gray-600'
                    : 'text-gray-500'
                )}
                onClick={() => setPageIndex(page - 1)}
                disabled={disabled}
              >
                {!isNaN(page) ? page : '...'}
              </button>
            </li>
          )
        })}
        <li>
          <button
            className={cn(
              'flex h-full items-center justify-center rounded-r-lg border border-gray-300 bg-white px-3 py-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-700',
              !hasNextPage && 'pointer-events-none'
            )}
            onClick={nextPage}
            disabled={!hasNextPage}
          >
            <span className="sr-only">Next</span>
            <HiChevronRight />
          </button>
        </li>
      </ul>
    </nav>
  )
}

const DataTable = <TData, TValue>({
  columns,
  data,
  manualFiltering,
  manualSorting,
  manualPagination,
  isLoading,
}: DataTableProps<TData, TValue>): JSX.Element => {
  const table = useReactTable({
    data,
    columns,
    state: {
      sorting: manualSorting?.state,
      pagination: manualPagination?.state ?? {
        pageIndex: 0,
        pageSize: GALLERY_LIMIT,
      },
      columnFilters: manualFiltering?.state,
    },
    ...(manualFiltering
      ? {
          manualFiltering: true,
          onColumnFiltersChange: (updater) => {
            const columnFilters = functionalUpdate(
              updater,
              manualFiltering.state
            )
            manualFiltering.onColumnFiltersChange(columnFilters)
          },
        }
      : {
          //
        }),
    ...(manualSorting
      ? {
          manualSorting: true,
          onSortingChange: (updater) => {
            const sortingState = functionalUpdate(updater, manualSorting.state)
            manualSorting.onSortingChange(sortingState)
          },
        }
      : { getSortedRowModel: getSortedRowModel() }),
    ...(manualPagination
      ? {
          manualPagination: true,
          pageCount: Math.ceil(
            manualPagination.dataCount / manualPagination.state.pageSize
          ),
          onPaginationChange: (updater) => {
            const paginationState = functionalUpdate(
              updater,
              manualPagination.state
            )
            manualPagination.onPaginationChange(paginationState)
          },
        }
      : {
          getPaginationRowModel: getPaginationRowModel(),
        }),
    getCoreRowModel: getCoreRowModel(),
    debugTable: true,
  })

  return (
    <div
      className={cn(
        'relative w-full space-y-4 overflow-hidden',
        isLoading && 'pointer-events-none opacity-50'
      )}
    >
      {manualFiltering?.render && manualFiltering.render(table)}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b text-xs uppercase">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th key={header.id} scope="col" className="px-4 py-3">
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="border-b hover:bg-gray-50">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-3">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td className="h-24 p-4 text-center" colSpan={columns.length}>
                  No results.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <Pagination
        currentPage={
          manualPagination
            ? manualPagination.state.pageIndex + 1
            : table.getState().pagination.pageIndex + 1
        }
        totalCount={manualPagination ? manualPagination.dataCount : data.length}
        totalPage={
          manualPagination
            ? Math.ceil(
                manualPagination.dataCount / manualPagination.state.pageSize
              )
            : table.getPageCount()
        }
        setPageIndex={(idx) => table.setPageIndex(idx)}
        previousPage={table.previousPage}
        nextPage={table.nextPage}
        hasPreviousPage={table.getCanPreviousPage()}
        hasNextPage={table.getCanNextPage()}
      />
    </div>
  )
}

export default DataTable
