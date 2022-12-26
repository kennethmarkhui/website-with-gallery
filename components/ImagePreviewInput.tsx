import { forwardRef, InputHTMLAttributes, MutableRefObject } from 'react'
import Image from 'next/image'
import { HiPhotograph, HiX } from 'react-icons/hi'

import { formatBytes } from 'lib/utils'

export const maxFileSize = 2 * 1024 * 1024 // 2MB

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  imagePreview: string | null
  fileListRef: MutableRefObject<FileList | undefined | null>
  removeFile: () => void
  errorMessage?: string
}

const ImagePreviewInput = forwardRef<HTMLInputElement, InputProps>(
  function ImagePreviewInput(
    { imagePreview, fileListRef, removeFile, errorMessage, ...rest },
    ref
  ) {
    return (
      <div className="relative mb-4 w-full">
        <input
          hidden
          type="file"
          ref={ref}
          {...rest}
          accept="image/*"
          className="peer"
        />
        <label
          htmlFor={rest.id}
          className="relative flex h-64 w-full flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 peer-enabled:cursor-pointer peer-enabled:hover:bg-gray-100"
        >
          {imagePreview ? (
            <Image
              src={imagePreview}
              fill
              className="max-h-full max-w-full object-contain"
              alt="preview"
              unoptimized
            />
          ) : (
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <HiPhotograph className="mb-3 h-10 w-10 text-gray-400" />
              <p className="mb-2 text-sm text-gray-500">
                <span className="font-semibold">Click to upload</span>
              </p>
              <p className="text-xs text-gray-500">
                {`Image only. (MAX. ${formatBytes(maxFileSize)})`}
              </p>
            </div>
          )}
        </label>
        {imagePreview && fileListRef.current && (
          <button
            type="button"
            className="absolute -top-2 -right-2 rounded-full border-2 border-dashed border-red-300 bg-red-100 p-1 text-red-300 hover:border-red-500 hover:text-red-500 disabled:pointer-events-none"
            onClick={removeFile}
          >
            <HiX />
          </button>
        )}
        {errorMessage && (
          <p className="absolute text-sm text-red-500">{errorMessage}</p>
        )}
      </div>
    )
  }
)

export default ImagePreviewInput
