-- CreateTable
CREATE TABLE "public"."LolChampion" (
    "key" INTEGER NOT NULL,
    "id" TEXT NOT NULL,
    "nameJa" TEXT NOT NULL,
    "nameEn" TEXT,
    "imageUrl" TEXT NOT NULL,
    "patch" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LolChampion_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "public"."TftMatchParticipant" (
    "id" TEXT NOT NULL,
    "matchId" TEXT NOT NULL,
    "puuid" TEXT NOT NULL,
    "placement" INTEGER NOT NULL,
    "level" INTEGER NOT NULL,
    "lastRound" INTEGER,
    "goldLeft" INTEGER,
    "playersEliminated" INTEGER,
    "totalDamageToPlayers" INTEGER,
    "augments" JSONB NOT NULL,
    "traits" JSONB NOT NULL,
    "units" JSONB NOT NULL,
    "companion" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TftMatchParticipant_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "LolChampion_id_idx" ON "public"."LolChampion"("id");

-- CreateIndex
CREATE INDEX "TftMatchParticipant_puuid_idx" ON "public"."TftMatchParticipant"("puuid");

-- CreateIndex
CREATE INDEX "TftMatchParticipant_placement_idx" ON "public"."TftMatchParticipant"("placement");

-- CreateIndex
CREATE UNIQUE INDEX "TftMatchParticipant_matchId_puuid_key" ON "public"."TftMatchParticipant"("matchId", "puuid");
