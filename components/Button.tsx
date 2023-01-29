import { ComponentPropsWithoutRef } from 'react'
import clsx from 'clsx'

interface ButtonProps extends ComponentPropsWithoutRef<'button'> {
  variant?: 'primary' | 'danger'
}

const Button = ({ variant = 'primary', ...rest }: ButtonProps): JSX.Element => {
  return (
    <button
      className={clsx(
        'w-full rounded-md border border-gray-300 px-5 py-2.5 text-center text-sm font-medium text-gray-500 focus:outline-none sm:w-auto',
        variant === 'primary' &&
          'enabled:hover:border-black enabled:hover:text-black',
        variant === 'danger' &&
          'enabled:hover:border-red-500 enabled:hover:text-red-500'
      )}
      {...rest}
    />
  )
}

export default Button
