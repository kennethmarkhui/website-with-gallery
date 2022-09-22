import { MutableRefObject, useEffect, useRef, useState } from 'react'

const useFilePreview = (
  fileList: FileList | undefined,
  defaultPreview?: string
): {
  preview: string | null
  fileListRef: MutableRefObject<FileList | undefined>
} => {
  const [preview, setPreview] = useState<string | null>(null)
  const fileListRef = useRef<FileList>()
  if (fileList?.length === 1) {
    fileListRef.current = fileList
  }

  useEffect(() => {
    if (!defaultPreview) {
      return
    }
    setPreview(defaultPreview)
  }, [defaultPreview])

  useEffect(() => {
    if (
      !fileList ||
      fileList.length !== 1 // Accept only 1 file
    ) {
      return
    }
    const objectUrl = URL.createObjectURL(fileList[0])
    setPreview(objectUrl)

    return () => {
      URL.revokeObjectURL(objectUrl)
    }
  }, [fileList])

  return { preview, fileListRef }
}

export default useFilePreview
