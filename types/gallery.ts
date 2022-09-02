import { Item } from 'prisma/prisma-client'

export type OmittedItem = Omit<Item, 'id' | 'dateAdded'>

export type FormValues = {
  itemId: string
  name?: string
  storage?: string
}
