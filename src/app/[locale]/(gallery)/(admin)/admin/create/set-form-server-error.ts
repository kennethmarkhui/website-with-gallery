import { Path, UseFormSetError } from 'react-hook-form'
import { typeToFlattenedError } from 'zod'

export default function setFormServerErrors<F extends Record<string, unknown>>({
  setError,
  errors: { formErrors, fieldErrors },
}: {
  setError: UseFormSetError<F>
  errors: Partial<typeToFlattenedError<F>>
}) {
  if (formErrors) {
    for (const message of formErrors) {
      setError('root.server', { message })
    }
  }
  if (fieldErrors) {
    for (const fieldName of Object.keys(fieldErrors).reverse() as Path<F>[]) {
      const errors = fieldErrors[fieldName]
      if (!errors) continue
      for (const message of errors) {
        setError(fieldName, { message }, { shouldFocus: true })
      }
    }
  }
}
