/*
  Warnings:

  - You are about to drop the column `movieId` on the `BlogPost` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "BlogPost" DROP CONSTRAINT "BlogPost_movieId_fkey";

-- AlterTable
ALTER TABLE "BlogPost" DROP COLUMN "movieId",
ADD COLUMN     "views" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "Tag" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BlogPostTag" (
    "blogPostId" INTEGER NOT NULL,
    "tagId" INTEGER NOT NULL,

    CONSTRAINT "BlogPostTag_pkey" PRIMARY KEY ("blogPostId","tagId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Tag_name_key" ON "Tag"("name");

-- AddForeignKey
ALTER TABLE "BlogPostTag" ADD CONSTRAINT "BlogPostTag_blogPostId_fkey" FOREIGN KEY ("blogPostId") REFERENCES "BlogPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BlogPostTag" ADD CONSTRAINT "BlogPostTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;
