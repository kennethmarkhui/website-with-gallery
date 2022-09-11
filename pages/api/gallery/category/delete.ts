import type { NextApiRequest, NextApiResponse } from 'next'
import { unstable_getServerSession } from 'next-auth'

import type { GalleryErrorResponse, GalleryMutateResponse } from 'types/gallery'
import { authOptions } from 'pages/api/auth/[...nextauth]'
import { prisma } from 'lib/prisma'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<GalleryMutateResponse | GalleryErrorResponse>
) {
  const session = await unstable_getServerSession(req, res, authOptions)

  if (!session || session.user.role !== 'ADMIN') {
    return res.status(401).json({
      error: {
        message: 'You must be an admin to view the protected content.',
      },
    })
  }

  const { id } = req.query

  if (req.method === 'DELETE' && id) {
    try {
      const deleteResponse = await prisma.category.delete({
        where: {
          id: id as string,
        },
        select: {
          name: true,
        },
      })
      return res
        .status(200)
        .json({ message: `${deleteResponse.name} has been deleted.` })
    } catch (error) {
      return res
        .status(400)
        .json({ error: { message: 'Failed to delete. Something went wrong.' } })
    }
  }
  return res.status(400).json({ error: { message: 'Something went wrong.' } })
}
