/*
  Warnings:

  - Added the required column `assists` to the `Match` table without a default value. This is not possible if the table is not empty.
  - Added the required column `champion` to the `Match` table without a default value. This is not possible if the table is not empty.
  - Added the required column `deaths` to the `Match` table without a default value. This is not possible if the table is not empty.
  - Added the required column `gameMode` to the `Match` table without a default value. This is not possible if the table is not empty.
  - Added the required column `kills` to the `Match` table without a default value. This is not possible if the table is not empty.
  - Added the required column `win` to the `Match` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Match" ADD COLUMN     "assists" INTEGER NOT NULL,
ADD COLUMN     "champion" TEXT NOT NULL,
ADD COLUMN     "deaths" INTEGER NOT NULL,
ADD COLUMN     "gameMode" TEXT NOT NULL,
ADD COLUMN     "kills" INTEGER NOT NULL,
ADD COLUMN     "win" BOOLEAN NOT NULL;
