import {
  MutableRefObject,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'

// This hook rely on react-hook-form to handle fileList state
const useFilePreview = (
  fileList: FileList | undefined | null,
  defaultPreview?: string
): {
  preview: string | null
  fileListRef: MutableRefObject<FileList | undefined | null>
  removeFile: (callback: () => void) => void
} => {
  const [preview, setPreview] = useState<string | null>(null)
  const fileListRef = useRef<FileList | null>()
  if (fileList?.length === 1) {
    fileListRef.current = fileList
  }

  const oldPreview = defaultPreview ?? null

  const removeFile = useCallback(
    (callback: () => void): void => {
      if (oldPreview) {
        setPreview(oldPreview)
      } else {
        setPreview(null)
      }
      fileListRef.current = null
      // callback to call react-hook-form's resetField
      callback()
    },
    [oldPreview]
  )

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

  return { preview, fileListRef, removeFile }
}

export default useFilePreview
