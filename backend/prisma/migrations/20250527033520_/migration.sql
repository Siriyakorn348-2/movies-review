/*
  Warnings:

  - Added the required column `updatedAt` to the `BlogPostImage` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "BlogPostImage" DROP CONSTRAINT "BlogPostImage_blogPostId_fkey";

-- AlterTable
ALTER TABLE "BlogPostImage" ADD COLUMN     "publicId" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "mimeType" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "BlogPostImage" ADD CONSTRAINT "BlogPostImage_blogPostId_fkey" FOREIGN KEY ("blogPostId") REFERENCES "BlogPost"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
