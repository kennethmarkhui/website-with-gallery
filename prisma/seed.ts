import { PrismaClient } from '@prisma/client'

import { LANGUAGES } from '../constants/i18n'
import cloudinary from '../lib/cloudinary'

const prisma = new PrismaClient()

const getSeedImages = async () => {
  try {
    // https://picsum.photos/
    const response = await fetch('https://picsum.photos/v2/list?limit=50')
    const data = (await response.json()) as {
      id: string
      author: string
      width: string
      height: string
      url: string
      download_url: string
    }[]
    return data.map(({ download_url }) => download_url)
  } catch (error) {
    throw new Error('getting seed images failed.')
  }
}

const seed = async () => {
  const categories = Array.from({ length: 40 }, (_, index) => `${index + 1}`)

  try {
    const images = await getSeedImages()

    await prisma.language.deleteMany()
    console.log('Languages deleted.')

    await prisma.category.deleteMany()
    console.log('Categories deleted.')

    await prisma.item.deleteMany()
    console.log('Items deleted.')

    await prisma.image.deleteMany()
    await cloudinary.api.delete_resources_by_prefix(
      process.env.CLOUDINARY_DEV_FOLDER!
    )
    console.log('Images deleted.')

    const languageIds = await prisma.$transaction(
      LANGUAGES.map((lang) =>
        prisma.language.create({ data: lang, select: { id: true, code: true } })
      )
    )

    const categoryIds = await prisma
      .$transaction(
        categories.map((index) =>
          prisma.category.create({
            data: {
              translations: {
                createMany: {
                  data: languageIds.map(({ id, code }) => ({
                    languageId: id,
                    name: `${code}-${index}`,
                  })),
                },
              },
            },
            select: { id: true },
          })
        )
      )
      .then((ids) => ids.map(({ id }) => id))
    console.log('Categories added.')

    let promises = []
    for (let index = 0; index < images.length; index++) {
      let url = images[index]
      promises.push(
        cloudinary.uploader.upload(url, {
          folder: process.env.CLOUDINARY_DEV_FOLDER,
        })
      )
    }

    const cloudinaryResponse = await Promise.all(promises)

    await prisma.$transaction(
      cloudinaryResponse.map(
        ({ public_id, secure_url, width, height, original_filename }, index) =>
          prisma.item.create({
            data: {
              id: `${index + 1}`,
              category: {
                connect: {
                  id: categoryIds[
                    Math.floor(Math.random() * categories.length)
                  ],
                },
              },
              image: {
                create: {
                  url: secure_url,
                  width,
                  height,
                  publicId: public_id,
                },
              },
              translations: {
                createMany: {
                  data: languageIds.map(({ id, code }) => ({
                    languageId: id,
                    name: `${code}-${original_filename}`,
                    storage: `${code}-storage`,
                  })),
                },
              },
            },
          })
      )
    )
    console.log('Items added.')
  } catch (error) {
    console.log(error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

seed()
