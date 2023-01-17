import {
  MutableRefObject,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'

// This hook rely on react-hook-form to handle fileList state
const useFilePreview = (
  fileList?: FileList,
  defaultPreview?: string
): {
  preview?: string
  fileListRef: MutableRefObject<FileList | undefined>
  removeFile: (callback: () => void) => void
} => {
  const [preview, setPreview] = useState<string>()
  const fileListRef = useRef<FileList>()
  if (fileList?.length === 1) {
    fileListRef.current = fileList
  }

  const oldPreview = defaultPreview

  const removeFile = useCallback(
    (callback: () => void): void => {
      if (oldPreview) {
        setPreview(oldPreview)
      } else {
        setPreview(undefined)
      }
      fileListRef.current = undefined
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
