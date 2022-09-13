/*
  Warnings:

  - You are about to drop the column `itemId` on the `Item` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Image" DROP CONSTRAINT "Image_itemId_fkey";

-- DropIndex
DROP INDEX "Item_itemId_key";

-- AlterTable
ALTER TABLE "Item" DROP COLUMN "itemId";

-- AddForeignKey
ALTER TABLE "Image" ADD CONSTRAINT "Image_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE CASCADE ON UPDATE CASCADE;
