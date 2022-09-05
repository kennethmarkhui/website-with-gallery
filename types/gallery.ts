import { Item } from 'prisma/prisma-client'

export type OmittedItem = Omit<Item, 'id' | 'dateAdded'>

export type OmittedItemKeys = keyof OmittedItem

export type FormValues = {
  itemId: string
  name?: string
  storage?: string
}

export type FormMode = 'create' | 'update'

export type MutateDataResponse = { message: string }

export type ErrorResponse = {
  error: { message: string; target?: OmittedItemKeys }
}
