/*
  Warnings:

  - Changed the type of `augments` on the `TftMatch` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `traits` on the `TftMatch` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `units` on the `TftMatch` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "public"."TftMatch" DROP COLUMN "augments",
ADD COLUMN     "augments" JSONB NOT NULL,
DROP COLUMN "traits",
ADD COLUMN     "traits" JSONB NOT NULL,
DROP COLUMN "units",
ADD COLUMN     "units" JSONB NOT NULL;
