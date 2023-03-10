import { ComponentPropsWithoutRef } from 'react'
import clsx from 'clsx'

interface ButtonProps extends ComponentPropsWithoutRef<'button'> {
  variant?: 'primary' | 'danger'
  fullWidth?: boolean
}

const Button = ({
  variant = 'primary',
  fullWidth,
  ...rest
}: ButtonProps): JSX.Element => {
  return (
    <button
      className={clsx(
        'flex items-center justify-center rounded-md border border-gray-300 px-5 py-2.5 text-center text-sm font-medium text-gray-500 focus:outline-none',
        variant === 'primary' &&
          'enabled:hover:border-black enabled:hover:text-black',
        variant === 'danger' &&
          'enabled:hover:border-red-500 enabled:hover:text-red-500',
        fullWidth ? 'w-full' : 'w-full sm:w-auto'
      )}
      {...rest}
    />
  )
}

export default Button
