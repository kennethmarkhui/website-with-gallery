import { forwardRef, InputHTMLAttributes, ReactNode } from 'react'

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  errorMessage?: string
  icon?: ReactNode
}

const FloatingLabelInput = forwardRef<HTMLInputElement, InputProps>(
  function FloatingLabelInput({ errorMessage, icon, ...rest }, ref) {
    return (
      <div className="group relative z-0 w-full">
        <input
          ref={ref}
          className="peer block w-full border-0 border-b-2 border-gray-300 bg-transparent px-0 py-2.5 text-sm text-black focus:border-black focus:outline-none focus:ring-0"
          autoComplete="off"
          placeholder=" "
          {...rest}
        />
        <label
          htmlFor={rest.id}
          className="absolute top-3 -z-10 origin-[0] -translate-y-6 scale-75 transform text-sm capitalize text-gray-500 duration-300 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:left-0 peer-focus:-translate-y-6 peer-focus:scale-75 peer-focus:font-medium peer-focus:text-black"
        >
          {rest.id}
        </label>
        {icon && (
          <button
            type="submit"
            className="absolute right-0 top-3 text-gray-500 enabled:hover:text-black enabled:focus:text-black"
          >
            {icon}
          </button>
        )}
        {errorMessage && (
          <p className="absolute text-sm text-red-500">{errorMessage}</p>
        )}
      </div>
    )
  }
)

export default FloatingLabelInput
