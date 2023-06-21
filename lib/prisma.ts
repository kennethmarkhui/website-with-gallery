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
  try {
    const { id } = await prisma.language.findFirstOrThrow({
      where: {
        code,
      },
      select: {
        id: true,
      },
    })
    return id
  } catch (error) {
    throw error
  }
}

export const transformTranslationFields = <
  O extends {
    [key: string]: { code: string; value: string; required?: boolean }[]
  }
>(
  fields: O
): Promise<
  Array<
    {
      [K in keyof O]: O[K] extends {
        required: true
      }[]
        ? string
        : string | null
    } & { languageId: string }
  >
> => {
  const languages = Array.from(
    new Set(Object.values(fields).flatMap((arr) => arr.map(({ code }) => code)))
  )

  const translationsArray = languages.map(async (code) => {
    const newObj = {} as {
      [K in keyof O]: O[K] extends {
        required: true
      }[]
        ? string
        : string | null
    }

    for (const key in fields) {
      const item = fields[key].find((i) => i.code === code)
      if (item?.required) {
        newObj[key] = item.value
      } else {
        // TODO: don't use as any
        newObj[key] = (item?.value || null) as any
      }
    }
    const newObjWithLanguageId = Object.assign(
      {
        languageId: await getLanguageId(code),
      },
      newObj
    )
    return newObjWithLanguageId
  })

  return Promise.all(translationsArray)
}
