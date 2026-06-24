-- CreateTable
CREATE TABLE "public"."LolMatch" (
    "matchId" TEXT NOT NULL,
    "gameCreation" BIGINT,
    "gameStartTimestamp" BIGINT,
    "gameEndTimestamp" BIGINT,
    "gameDuration" INTEGER,
    "gameVersion" TEXT NOT NULL,
    "patch" TEXT NOT NULL,
    "queueId" INTEGER NOT NULL,
    "gameMode" TEXT NOT NULL,
    "playedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LolMatch_pkey" PRIMARY KEY ("matchId")
);

-- CreateTable
CREATE TABLE "public"."LolParticipant" (
    "id" TEXT NOT NULL,
    "matchId" TEXT NOT NULL,
    "puuid" TEXT NOT NULL,
    "riotIdGameName" TEXT,
    "riotIdTagline" TEXT,
    "participantId" INTEGER NOT NULL,
    "teamId" INTEGER NOT NULL,
    "championId" INTEGER NOT NULL,
    "championName" TEXT NOT NULL,
    "teamPosition" TEXT,
    "individualPosition" TEXT,
    "win" BOOLEAN NOT NULL,
    "kills" INTEGER NOT NULL,
    "deaths" INTEGER NOT NULL,
    "assists" INTEGER NOT NULL,
    "champLevel" INTEGER,
    "goldEarned" INTEGER,
    "totalMinionsKilled" INTEGER,
    "neutralMinionsKilled" INTEGER,
    "totalDamageDealtToChampions" INTEGER,
    "totalDamageTaken" INTEGER,
    "visionScore" INTEGER,
    "wardsPlaced" INTEGER,
    "wardsKilled" INTEGER,
    "summoner1Id" INTEGER,
    "summoner2Id" INTEGER,
    "item0" INTEGER,
    "item1" INTEGER,
    "item2" INTEGER,
    "item3" INTEGER,
    "item4" INTEGER,
    "item5" INTEGER,
    "item6" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LolParticipant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."LolTeam" (
    "id" TEXT NOT NULL,
    "matchId" TEXT NOT NULL,
    "teamId" INTEGER NOT NULL,
    "win" BOOLEAN NOT NULL,
    "baronKills" INTEGER,
    "dragonKills" INTEGER,
    "riftHeraldKills" INTEGER,
    "towerKills" INTEGER,
    "inhibitorKills" INTEGER,
    "firstBlood" BOOLEAN,
    "firstTower" BOOLEAN,
    "firstDragon" BOOLEAN,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LolTeam_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "LolParticipant_puuid_idx" ON "public"."LolParticipant"("puuid");

-- CreateIndex
CREATE INDEX "LolParticipant_championName_idx" ON "public"."LolParticipant"("championName");

-- CreateIndex
CREATE INDEX "LolParticipant_teamPosition_idx" ON "public"."LolParticipant"("teamPosition");

-- CreateIndex
CREATE UNIQUE INDEX "LolParticipant_matchId_puuid_key" ON "public"."LolParticipant"("matchId", "puuid");

-- CreateIndex
CREATE UNIQUE INDEX "LolTeam_matchId_teamId_key" ON "public"."LolTeam"("matchId", "teamId");

-- AddForeignKey
ALTER TABLE "public"."LolParticipant" ADD CONSTRAINT "LolParticipant_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "public"."LolMatch"("matchId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."LolTeam" ADD CONSTRAINT "LolTeam_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "public"."LolMatch"("matchId") ON DELETE CASCADE ON UPDATE CASCADE;
