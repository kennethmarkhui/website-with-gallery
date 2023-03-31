import { PrismaClient } from '@prisma/client'

import cloudinary from '../lib/cloudinary'

const prisma = new PrismaClient()

interface CloudinarySearchResource {
  asset_id: string
  public_id: string
  folder: string
  filename: string
  format: string
  version: number
  resource_type: string
  type: string
  created_at: string
  uploaded_at: string
  bytes: number
  backup_bytes: number
  width: number
  height: number
  aspect_ratio: number
  pixels: number
  url: string
  secure_url: string
  status: string
  access_mode: string
  access_control: null
  etag: string
  created_by: null
  uploaded_by: null
}

interface CloudinarySearchResponse {
  total_count: number
  time: number
  resources: CloudinarySearchResource[]
  rate_limit_allowed: number
  rate_limit_reset_at: Date
  rate_limit_remaining: number
}

const getSampleImages = async (): Promise<CloudinarySearchResponse> => {
  try {
    return await cloudinary.search
      .expression(
        `folder=${process.env.CLOUDINARY_SAMPLE_FOLDER} AND resource_type:image`
      )
      .max_results(100)
      .execute()
  } catch (error) {
    throw new Error('getting cloudinary sample images failed.')
  }
}

const seed = async () => {
  const categories = Array.from({ length: 40 }, (_, index) => `${index + 1}`)
  const { resources } = await getSampleImages()

  try {
    await prisma.category.deleteMany()
    console.log('Categories deleted.')

    await prisma.item.deleteMany()
    console.log('Items deleted.')

    await prisma.image.deleteMany()
    console.log('Images deleted.')

    await prisma.category.createMany({
      data: categories.map((category) => ({ name: category })),
      skipDuplicates: true,
    })
    console.log('Categories added.')

    await prisma.$transaction(
      resources.map(
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
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

seed()
