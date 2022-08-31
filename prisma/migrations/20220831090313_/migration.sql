-- CreateTable
CREATE TABLE "Item" (
    "id" SERIAL NOT NULL,
    "itemId" TEXT NOT NULL,
    "name" TEXT,
    "storage" TEXT,
    "dateAdded" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Item_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Item_itemId_key" ON "Item"("itemId");
