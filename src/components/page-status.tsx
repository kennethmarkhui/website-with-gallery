interface PageStatusProps {
  children?: React.ReactNode
  title?: string
  description?: string
}

export default function PageStatus({
  children,
  title,
  description,
}: PageStatusProps) {
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
