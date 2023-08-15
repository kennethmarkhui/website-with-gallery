import type { NextApiRequest } from 'next'
import { Fields, Files, Options, formidable } from 'formidable'

// TODO: @types/formidable provides wrong FormidableError type
// export const FormidableError = errors.FormidableError

export const formidableOptions: Options = {
  maxFiles: 1,
  maxFileSize: 2 * 1024 * 1024, // 2MB
}

export const parseForm = async (
  req: NextApiRequest
): Promise<{ fields: Fields; files: Files }> => {
  return await new Promise((resolve, reject) => {
    const form = formidable({
      maxFiles: formidableOptions.maxFiles,
      maxFileSize: formidableOptions.maxFileSize,
    })

    form.parse(req, (err, fields, files) => {
      if (err) return reject(err)
      resolve({ fields, files })
    })
  })
}
