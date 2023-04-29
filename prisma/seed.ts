import { PrismaClient } from '@prisma/client'

import cloudinary from '../lib/cloudinary'

const prisma = new PrismaClient()

const getSeedImages = async (): Promise<string[]> => {
  try {
    // https://shibe.online/
    const response = await fetch('https://shibe.online/api/cats?count=50')
    return await response.json()
  } catch (error) {
    throw new Error('getting seed images failed.')
  }
}

const seed = async () => {
  const categories = Array.from({ length: 40 }, (_, index) => `${index + 1}`)
  const images = await getSeedImages()

  try {
    await prisma.category.deleteMany()
    console.log('Categories deleted.')

    await prisma.item.deleteMany()
    console.log('Items deleted.')

    await prisma.image.deleteMany()
    await cloudinary.api.delete_resources_by_prefix(
      process.env.CLOUDINARY_DEV_FOLDER!
    )
    console.log('Images deleted.')

    await prisma.category.createMany({
      data: categories.map((category) => ({ name: category })),
      skipDuplicates: true,
    })
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
        ({ public_id, secure_url, width, height, filename }, index) =>
          prisma.item.create({
            data: {
              id: `${index + 1}`,
              name: filename,
              category: {
                connect: {
                  name: categories[
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
