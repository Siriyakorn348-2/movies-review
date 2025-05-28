/*
  Warnings:

  - You are about to drop the column `imageData` on the `BlogPostImage` table. All the data in the column will be lost.
  - You are about to drop the column `blogPostId` on the `Comment` table. All the data in the column will be lost.
  - Added the required column `imageUrl` to the `BlogPostImage` table without a default value. This is not possible if the table is not empty.
  - Added the required column `commentableId` to the `Comment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `commentableType` to the `Comment` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Comment" DROP CONSTRAINT "Comment_blogPostId_fkey";

-- AlterTable
ALTER TABLE "BlogPostImage" DROP COLUMN "imageData",
ADD COLUMN     "imageUrl" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Comment" DROP COLUMN "blogPostId",
ADD COLUMN     "commentableId" INTEGER NOT NULL,
ADD COLUMN     "commentableType" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "Movies" (
    "movieId" SERIAL NOT NULL,
    "apiId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "posterUrl" TEXT,
    "releaseDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Movies_pkey" PRIMARY KEY ("movieId")
);

-- CreateTable
CREATE TABLE "Genre" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Genre_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MovieGenre" (
    "movieId" INTEGER NOT NULL,
    "genreId" INTEGER NOT NULL,

    CONSTRAINT "MovieGenre_pkey" PRIMARY KEY ("movieId","genreId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Movies_apiId_key" ON "Movies"("apiId");

-- CreateIndex
CREATE UNIQUE INDEX "Genre_name_key" ON "Genre"("name");

-- CreateIndex
CREATE INDEX "Review_movieId_idx" ON "Review"("movieId");

-- AddForeignKey
ALTER TABLE "MovieGenre" ADD CONSTRAINT "MovieGenre_movieId_fkey" FOREIGN KEY ("movieId") REFERENCES "Movies"("movieId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MovieGenre" ADD CONSTRAINT "MovieGenre_genreId_fkey" FOREIGN KEY ("genreId") REFERENCES "Genre"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_movieId_fkey" FOREIGN KEY ("movieId") REFERENCES "Movies"("movieId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FavoriteMovie" ADD CONSTRAINT "FavoriteMovie_movieId_fkey" FOREIGN KEY ("movieId") REFERENCES "Movies"("movieId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BlogPost" ADD CONSTRAINT "BlogPost_movieId_fkey" FOREIGN KEY ("movieId") REFERENCES "Movies"("movieId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_commentableId_fkey" FOREIGN KEY ("commentableId") REFERENCES "BlogPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;
