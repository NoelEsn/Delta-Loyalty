-- CreateTable
CREATE TABLE "pins" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "axis" TEXT NOT NULL,
    "level" INTEGER NOT NULL,
    "label" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "metallic" TEXT NOT NULL,
    "imageUrl" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "pins_axis_level_key" ON "pins"("axis", "level");
