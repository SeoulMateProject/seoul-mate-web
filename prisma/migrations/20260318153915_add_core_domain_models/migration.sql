/*
  Warnings:

  - A unique constraint covering the columns `[supabaseUserId]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `supabaseUserId` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "supabaseUserId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "Place" (
    "id" TEXT NOT NULL,
    "externalId" TEXT,
    "name" TEXT NOT NULL,
    "district" TEXT,
    "address" TEXT,
    "newAddress" TEXT,
    "phone" TEXT,
    "website" TEXT,
    "openingHours" TEXT,
    "openDays" TEXT,
    "closedDays" TEXT,
    "transportInfo" TEXT,
    "tags" TEXT[],
    "accessibility" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Place_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Diary" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "placeId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "likeCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Diary_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DiaryLike" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "diaryId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DiaryLike_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DiaryScrap" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "diaryId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DiaryScrap_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlaceLike" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "placeId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PlaceLike_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlaceList" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlaceList_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlaceListItem" (
    "id" TEXT NOT NULL,
    "placeListId" TEXT NOT NULL,
    "placeId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PlaceListItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Place_externalId_key" ON "Place"("externalId");

-- CreateIndex
CREATE UNIQUE INDEX "DiaryLike_userId_diaryId_key" ON "DiaryLike"("userId", "diaryId");

-- CreateIndex
CREATE UNIQUE INDEX "DiaryScrap_userId_diaryId_key" ON "DiaryScrap"("userId", "diaryId");

-- CreateIndex
CREATE UNIQUE INDEX "PlaceLike_userId_placeId_key" ON "PlaceLike"("userId", "placeId");

-- CreateIndex
CREATE UNIQUE INDEX "PlaceListItem_placeListId_placeId_key" ON "PlaceListItem"("placeListId", "placeId");

-- CreateIndex
CREATE UNIQUE INDEX "User_supabaseUserId_key" ON "User"("supabaseUserId");

-- AddForeignKey
ALTER TABLE "Diary" ADD CONSTRAINT "Diary_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Diary" ADD CONSTRAINT "Diary_placeId_fkey" FOREIGN KEY ("placeId") REFERENCES "Place"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiaryLike" ADD CONSTRAINT "DiaryLike_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiaryLike" ADD CONSTRAINT "DiaryLike_diaryId_fkey" FOREIGN KEY ("diaryId") REFERENCES "Diary"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiaryScrap" ADD CONSTRAINT "DiaryScrap_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiaryScrap" ADD CONSTRAINT "DiaryScrap_diaryId_fkey" FOREIGN KEY ("diaryId") REFERENCES "Diary"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlaceLike" ADD CONSTRAINT "PlaceLike_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlaceLike" ADD CONSTRAINT "PlaceLike_placeId_fkey" FOREIGN KEY ("placeId") REFERENCES "Place"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlaceList" ADD CONSTRAINT "PlaceList_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlaceListItem" ADD CONSTRAINT "PlaceListItem_placeListId_fkey" FOREIGN KEY ("placeListId") REFERENCES "PlaceList"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlaceListItem" ADD CONSTRAINT "PlaceListItem_placeId_fkey" FOREIGN KEY ("placeId") REFERENCES "Place"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
