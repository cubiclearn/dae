import {
  MAXIMUM_ALLOWED_UPLOAD_FILE_SIZE,
  ONE_MEGABYTE_IN_BYTES,
} from '@dae/constants'
import { Fields, Files, IncomingForm } from 'formidable'
import { NextApiRequest } from 'next/types'
import { Address } from 'viem'

export const sanitizeAddress = (address: Address) => {
  return address.toLowerCase()
}

export const asyncParse = (
  req: NextApiRequest,
): Promise<{ fields: Fields; files: Files }> =>
  new Promise((resolve, reject) => {
    const form = new IncomingForm({
      multiples: true,
      maxFileSize: MAXIMUM_ALLOWED_UPLOAD_FILE_SIZE,
    })
    form.parse(req, (err, fields, files) => {
      if (err && err.code === 1009) {
        return reject(
          new Error(
            `Sorry, the file you uploaded exceeds the maximum allowed size of ${
              MAXIMUM_ALLOWED_UPLOAD_FILE_SIZE / ONE_MEGABYTE_IN_BYTES
            } MB.`,
          ),
        )
      }
      if (err) return reject(err)
      resolve({ fields, files })
    })
  })
