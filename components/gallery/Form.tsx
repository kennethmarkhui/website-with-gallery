import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { useForm, SubmitHandler } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { FaSpinner } from 'react-icons/fa'

import FloatingLabelInput from '../FloatingLabelInput'
import FloatingLabelSelect from '../FloatingLabelSelect'
import Button from '../Button'
import ImagePreviewInput from '../ImagePreviewInput'
import type {
  GalleryFormMode,
  GalleryFormFields,
  DefaultGalleryFormFields,
} from 'types/gallery'
import { GalleryFormFieldsSchema } from 'lib/validations'
import useCategory from 'hooks/gallery/category/useCategory'
import useCreate from 'hooks/gallery/mutations/useCreate'
import useUpdate from 'hooks/gallery/mutations/useUpdate'
import useDelete from 'hooks/gallery/mutations/useDelete'

interface GalleryFormProps {
  mode?: GalleryFormMode
  defaultFormValues?: DefaultGalleryFormFields
}

interface GalleryFormCreateProps {
  mode?: 'create'
}

interface GalleryFormUpdateProps {
  mode: 'update'
  defaultFormValues: DefaultGalleryFormFields
}

function GalleryForm({ mode }: GalleryFormCreateProps): JSX.Element
function GalleryForm({
  mode,
  defaultFormValues,
}: GalleryFormUpdateProps): JSX.Element
function GalleryForm({
  mode = 'create',
  defaultFormValues,
}: GalleryFormProps): JSX.Element {
  const router = useRouter()

  const {
    register,
    formState: { errors, isDirty },
    watch,
    handleSubmit,
    reset,
    resetField,
    setError,
    setValue,
  } = useForm<GalleryFormFields>({
    resolver: zodResolver(GalleryFormFieldsSchema),
    defaultValues: {
      id: '',
      name: '',
      storage: '',
      category: '',
      image: undefined,
    },
  })

  const { data: categories, status: categoryStatus } = useCategory()

  useEffect(() => {
    if (mode !== 'update' || !defaultFormValues || categoryStatus !== 'success')
      return
    reset({ ...defaultFormValues, image: undefined })
  }, [mode, defaultFormValues, reset, categoryStatus])

  const { mutate: createMutate, status: createStatus } = useCreate()
  const { mutate: updateMutate, status: updateStatus } = useUpdate()
  const { mutate: deleteMutate, status: deleteStatus } = useDelete()

  const formIsLoading =
    createStatus === 'loading' ||
    updateStatus === 'loading' ||
    deleteStatus === 'loading' ||
    categoryStatus === 'loading'

  const imageFileList = watch('image')

  const onSubmit: SubmitHandler<GalleryFormFields> = (data) => {
    return mode === 'update'
      ? updateMutate(data, {
          onSuccess: () => {
            reset()
            router.push('/gallery/admin')
          },
          onError: ({ error }) => {
            if (error?.target) {
              setError(
                error.target,
                { message: error.message },
                { shouldFocus: true }
              )
            }
          },
        })
      : createMutate(data, {
          onSuccess: () => {
            reset()
            router.push('/gallery/admin')
          },
          onError: ({ error }) => {
            if (error?.target) {
              setError(
                error.target,
                { message: error.message },
                { shouldFocus: true }
              )
            }
          },
        })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-4">
      <fieldset className="space-y-6" disabled={formIsLoading}>
        <FloatingLabelInput
          id="id"
          readOnly={mode === 'update'}
          {...register('id')}
          errorMessage={errors.id?.message}
        />
        <FloatingLabelInput id="name" {...register('name')} />
        <FloatingLabelInput id="storage" {...register('storage')} />
        <FloatingLabelSelect
          id="category"
          {...register('category')}
          defaultSelected={defaultFormValues?.category}
          options={categories}
          loading={categoryStatus === 'loading'}
        />
        <ImagePreviewInput
          id="image"
          {...register('image')}
          defaultPreview={defaultFormValues?.image?.url}
          fileList={imageFileList}
          errorMessage={errors.image?.message}
          setFormValue={setValue}
          removeFormValue={() => resetField('image')}
        />
        <div className="mt-4 flex gap-4 ">
          <Button type="submit" disabled={!isDirty}>
            {createStatus === 'loading' || updateStatus === 'loading' ? (
              <span className="flex items-center justify-center gap-1">
                Submitting
                <FaSpinner className="animate-spin" />
              </span>
            ) : (
              'Submit'
            )}
          </Button>
          {mode === 'update' && defaultFormValues && (
            <Button
              type="button"
              variant="danger"
              onClick={() =>
                deleteMutate(
                  {
                    id: defaultFormValues.id,
                    publicId:
                      defaultFormValues.image?.publicId !== ''
                        ? defaultFormValues.image?.publicId
                        : undefined,
                  },
                  {
                    onSuccess: () => {
                      reset()
                      router.push('/gallery/admin')
                    },
                  }
                )
              }
            >
              {deleteStatus === 'loading' ? (
                <span className="flex items-center justify-center gap-1">
                  Deleting
                  <FaSpinner className="animate-spin" />
                </span>
              ) : (
                'Delete'
              )}
            </Button>
          )}
        </div>
      </fieldset>
    </form>
  )
}

export default GalleryForm
