import { forwardRef } from 'react'

type InputProps = React.DetailedHTMLProps<
  React.InputHTMLAttributes<HTMLInputElement>,
  HTMLInputElement
> & { errorMessage?: string }

export const FloatingLabelInput = forwardRef<HTMLInputElement, InputProps>(
  function FloatingLabelInput(props, ref) {
    return (
      <div className="group relative z-0 mb-6 w-full">
        <input
          ref={ref}
          className="peer block w-full border-0 border-b-2 border-gray-300 bg-transparent py-2.5 px-0 text-sm text-black focus:border-black focus:outline-none focus:ring-0"
          autoComplete="off"
          placeholder=" "
          {...props}
        ></input>
        <label
          htmlFor={props.id}
          className="absolute top-3 -z-10 origin-[0] -translate-y-6 scale-75 transform text-sm capitalize text-gray-500 duration-300 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:left-0 peer-focus:-translate-y-6 peer-focus:scale-75 peer-focus:font-medium peer-focus:text-black"
        >
          {props.name}
        </label>
        {props.errorMessage && (
          <p className="absolute text-sm text-red-500">{props.errorMessage}</p>
        )}
      </div>
    )
  }
)
