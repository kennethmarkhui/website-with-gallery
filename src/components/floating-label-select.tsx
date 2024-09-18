import { ChangeEvent, forwardRef, SelectHTMLAttributes } from 'react'
import { FaSpinner } from 'react-icons/fa'

type Option = {
  id: string
  name: string
}

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  defaultSelected?: string
  options?: Option[]
  loading?: boolean
}

const FloatingLabelSelect = forwardRef<HTMLSelectElement, SelectProps>(
  function FloatingLabelSelect(
    { defaultSelected, options, loading, ...rest },
    ref
  ) {
    return (
      <div className="group relative z-0 mb-6 w-full">
        {loading && (
          <FaSpinner className="absolute right-12 top-3 animate-spin text-gray-500" />
        )}
        <select
          ref={ref}
          {...rest}
          data-value={defaultSelected ?? ''}
          onChange={(event: ChangeEvent<HTMLSelectElement>) => {
            if (rest.onChange) {
              rest.onChange(event)
            }
            event.currentTarget.setAttribute(
              'data-value',
              event.currentTarget.value
            )
          }}
          className="peer block w-full border-0 border-b-2 border-gray-300 bg-transparent px-0 py-2.5 text-sm text-black focus:border-black focus:outline-none focus:ring-0"
        >
          {loading && (!options || options.length === 0) && (
            <option value=""></option>
          )}
          {!loading && options && options.length !== 0 && (
            <>
              <option value=""></option>
              {options.map(({ id, name }) => {
                return (
                  <option key={id} value={id}>
                    {name}
                  </option>
                )
              })}
            </>
          )}
        </select>
        <label
          htmlFor={rest.id}
          className="absolute top-3 -z-10 origin-[0] text-sm capitalize text-gray-500 duration-300 peer-focus:left-0 peer-focus:-translate-y-6 peer-focus:scale-75 peer-focus:font-medium peer-focus:text-black [:merge(.peer):not([data-value=''])_~_&]:-translate-y-6 [:merge(.peer):not([data-value=''])_~_&]:scale-75"
        >
          {rest.id}
        </label>
      </div>
    )
  }
)

export default FloatingLabelSelect
