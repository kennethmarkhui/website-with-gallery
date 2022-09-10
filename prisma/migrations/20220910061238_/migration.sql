-- DropForeignKey
ALTER TABLE "Item" DROP CONSTRAINT "Item_itemId_fkey";

-- AlterTable
ALTER TABLE "Item" ADD COLUMN     "categoryId" TEXT;

-- AddForeignKey
ALTER TABLE "Item" ADD CONSTRAINT "Item_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;
