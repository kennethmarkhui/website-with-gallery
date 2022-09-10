/*
  Warnings:

  - You are about to drop the column `categoryId` on the `Item` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Item" DROP CONSTRAINT "Item_categoryId_fkey";

-- AlterTable
ALTER TABLE "Item" DROP COLUMN "categoryId",
ADD COLUMN     "category" TEXT;

-- AddForeignKey
ALTER TABLE "Item" ADD CONSTRAINT "Item_category_fkey" FOREIGN KEY ("category") REFERENCES "Category"("name") ON DELETE SET NULL ON UPDATE CASCADE;
