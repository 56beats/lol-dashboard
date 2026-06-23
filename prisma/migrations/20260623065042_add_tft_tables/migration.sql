-- CreateTable
CREATE TABLE "public"."TftMatch" (
    "id" TEXT NOT NULL,
    "placement" INTEGER NOT NULL,
    "level" INTEGER NOT NULL,
    "augments" TEXT[],
    "traits" TEXT[],
    "units" TEXT[],
    "playedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TftMatch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."TftRankSnapshot" (
    "id" TEXT NOT NULL,
    "queue" TEXT NOT NULL,
    "tier" TEXT NOT NULL,
    "rank" TEXT NOT NULL,
    "lp" INTEGER NOT NULL,
    "wins" INTEGER NOT NULL,
    "losses" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TftRankSnapshot_pkey" PRIMARY KEY ("id")
);
