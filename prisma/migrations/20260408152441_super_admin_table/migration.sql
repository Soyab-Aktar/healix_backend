-- CreateTable
CREATE TABLE "superAdmin" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "profilePhoto" TEXT,
    "contactNumber" TEXT,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deleteAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "superAdmin_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "superAdmin_email_key" ON "superAdmin"("email");

-- CreateIndex
CREATE UNIQUE INDEX "superAdmin_userId_key" ON "superAdmin"("userId");

-- CreateIndex
CREATE INDEX "idx_superAdmin_email" ON "superAdmin"("email");

-- CreateIndex
CREATE INDEX "idx_superAdmin_isDeleted" ON "superAdmin"("isDeleted");

-- AddForeignKey
ALTER TABLE "superAdmin" ADD CONSTRAINT "superAdmin_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
