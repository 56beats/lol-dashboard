-- CreateTable
CREATE TABLE "public"."TftChampion" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "cost" INTEGER,
    "imageUrl" TEXT NOT NULL,
    "ddragonImageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TftChampion_pkey" PRIMARY KEY ("id")
);
