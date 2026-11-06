-- CreateTable
CREATE TABLE "BeforeAfterCase" (
    "id" TEXT NOT NULL,
    "content" JSONB NOT NULL,
    "beforeImageId" TEXT NOT NULL,
    "afterImageId" TEXT NOT NULL,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BeforeAfterCase_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BeforeAfterCase_isPublished_displayOrder_idx" ON "BeforeAfterCase"("isPublished", "displayOrder");

-- CreateIndex
CREATE INDEX "BeforeAfterCase_beforeImageId_idx" ON "BeforeAfterCase"("beforeImageId");

-- CreateIndex
CREATE INDEX "BeforeAfterCase_afterImageId_idx" ON "BeforeAfterCase"("afterImageId");

-- AddForeignKey
ALTER TABLE "BeforeAfterCase" ADD CONSTRAINT "BeforeAfterCase_beforeImageId_fkey" FOREIGN KEY ("beforeImageId") REFERENCES "Media"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BeforeAfterCase" ADD CONSTRAINT "BeforeAfterCase_afterImageId_fkey" FOREIGN KEY ("afterImageId") REFERENCES "Media"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
