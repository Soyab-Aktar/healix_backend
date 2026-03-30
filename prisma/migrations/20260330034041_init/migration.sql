-- CreateTable
CREATE TABLE "specialites" (
    "id" TEXT NOT NULL,
    "title" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "icon" VARCHAR(255),
    "createAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "specialites_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "specialites_title_key" ON "specialites"("title");

-- CreateIndex
CREATE INDEX "idx_specialty_isDeleted" ON "specialites"("isDeleted");

-- CreateIndex
CREATE INDEX "idx_specialty_title" ON "specialites"("title");
