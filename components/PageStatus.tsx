import { ReactNode } from 'react'

interface PageStatusProps {
  children?: ReactNode
  title?: string
  description?: string
}

const PageStatus = ({
  children,
  title,
  description,
}: PageStatusProps): JSX.Element => {
  return (
    <div className="flex min-h-[calc(100vh-8rem)] w-full flex-col items-center justify-center gap-4 text-center">
      {children ? (
        children
      ) : (
        <>
          <h1 className="text-3xl">{title}</h1>
          <p>{description}</p>
        </>
      )}
    </div>
  )
}

export default PageStatus
