import type { NextApiRequest } from 'next'
import formidable, { Fields, Files, Options } from 'formidable'

export const FormidableError = formidable.errors.FormidableError

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
