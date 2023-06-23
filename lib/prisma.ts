import { PrismaClient } from 'prisma/prisma-client'

// https://www.prisma.io/docs/guides/database/troubleshooting-orm/help-articles/nextjs-prisma-client-dev-practices

declare global {
  // allow global `var` declarations
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined
}

export const prisma =
  global.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV !== 'production' ? ['query'] : [],
  })

if (process.env.NODE_ENV !== 'production') global.prisma = prisma

export const getLanguageId = async (code: string) => {
  const { id } = await prisma.language.findFirstOrThrow({
    where: {
      code,
    },
    select: {
      id: true,
    },
  })
  return id
}

export const transformTranslationFields = <
  Fields extends {
    [key: string]: { code: string; value: string }[]
  },
  RequiredFieldKeys extends { [K in keyof Fields]?: boolean }
>(
  fields: Fields,
  requiredKeys?: RequiredFieldKeys
) => {
  const languages = Array.from(
    new Set(Object.values(fields).flatMap((arr) => arr.map(({ code }) => code)))
  )

  const fieldKeysToRequire: (keyof RequiredFieldKeys)[] = []
  for (const key in requiredKeys) {
    if (requiredKeys[key]) {
      fieldKeysToRequire.push(key)
    }
  }

  const translationsArray = languages.map(async (code) => {
    const newObj = {} as {
      [K in keyof Fields]: K extends {
        [Key in keyof RequiredFieldKeys]: RequiredFieldKeys[Key] extends true
          ? Key
          : never
      }[keyof RequiredFieldKeys]
        ? string
        : string | null
    }

    for (const key in fields) {
      const item = fields[key].find((i) => i.code === code)
      if (fieldKeysToRequire.includes(key) && item) {
        newObj[key] = item.value
      } else {
        // TODO: don't use as any
        newObj[key] = (item?.value || null) as any
      }
    }

    return Object.assign(
      {
        languageId: await getLanguageId(code),
      },
      newObj
    )
  })

  return Promise.all(translationsArray)
}
