BEGIN;

-- Create RiotAccount table first so foreign keys can be added safely.
CREATE TABLE IF NOT EXISTS "public"."RiotAccount" (
    "id" TEXT NOT NULL,
    "gameName" TEXT,
    "tagLine" TEXT,
    "puuid" TEXT,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "profileIconId" INTEGER,
    "summonerLevel" INTEGER,
    "lastProfileSync" TIMESTAMP(3),
    "lastMatchSync" TIMESTAMP(3),
    "lastRankSync" TIMESTAMP(3),
    "lastTftMatchSync" TIMESTAMP(3),
    "lastTftRankSync" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RiotAccount_pkey" PRIMARY KEY ("id")
);

-- Create the required accounts first. Re-running the migration should stay safe.
INSERT INTO "public"."RiotAccount" (
    "id",
    "gameName",
    "tagLine",
    "isPrimary",
    "createdAt",
    "updatedAt"
) VALUES
    ('main', '56beats', '3460', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('sub', 'エグチ', 'JP1', false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO NOTHING;

-- Add nullable foreign key columns first (safe for existing rows).
ALTER TABLE "public"."RankSnapshot"
    ADD COLUMN IF NOT EXISTS "riotAccountId" TEXT;

ALTER TABLE "public"."TftRankSnapshot"
    ADD COLUMN IF NOT EXISTS "riotAccountId" TEXT;

ALTER TABLE "public"."TftMatch"
    ADD COLUMN IF NOT EXISTS "riotAccountId" TEXT,
    ADD COLUMN IF NOT EXISTS "matchId" TEXT;

-- Backfill existing rows to the main account (existing data remains intact).
UPDATE "public"."RankSnapshot"
SET "riotAccountId" = 'main'
WHERE "riotAccountId" IS NULL;

UPDATE "public"."TftRankSnapshot"
SET "riotAccountId" = 'main'
WHERE "riotAccountId" IS NULL;

UPDATE "public"."TftMatch"
SET "riotAccountId" = 'main',
    "matchId" = COALESCE("matchId", "id")
WHERE "riotAccountId" IS NULL OR "matchId" IS NULL;

-- Make the new columns NOT NULL after backfill.
ALTER TABLE "public"."RankSnapshot"
    ALTER COLUMN "riotAccountId" SET NOT NULL;

ALTER TABLE "public"."TftRankSnapshot"
    ALTER COLUMN "riotAccountId" SET NOT NULL;

ALTER TABLE "public"."TftMatch"
    ALTER COLUMN "riotAccountId" SET NOT NULL,
    ALTER COLUMN "matchId" SET NOT NULL;

-- Add foreign keys.
ALTER TABLE "public"."RankSnapshot"
    ADD CONSTRAINT "RankSnapshot_riotAccountId_fkey"
    FOREIGN KEY ("riotAccountId") REFERENCES "public"."RiotAccount" ("id")
    ON DELETE RESTRICT
    ON UPDATE CASCADE;

ALTER TABLE "public"."TftRankSnapshot"
    ADD CONSTRAINT "TftRankSnapshot_riotAccountId_fkey"
    FOREIGN KEY ("riotAccountId") REFERENCES "public"."RiotAccount" ("id")
    ON DELETE RESTRICT
    ON UPDATE CASCADE;

ALTER TABLE "public"."TftMatch"
    ADD CONSTRAINT "TftMatch_riotAccountId_fkey"
    FOREIGN KEY ("riotAccountId") REFERENCES "public"."RiotAccount" ("id")
    ON DELETE RESTRICT
    ON UPDATE CASCADE;

-- Add indexes and the composite unique constraint for TftMatch.
CREATE INDEX IF NOT EXISTS "RankSnapshot_riotAccountId_idx"
    ON "public"."RankSnapshot" ("riotAccountId");

CREATE INDEX IF NOT EXISTS "TftRankSnapshot_riotAccountId_idx"
    ON "public"."TftRankSnapshot" ("riotAccountId");

CREATE INDEX IF NOT EXISTS "TftMatch_riotAccountId_idx"
    ON "public"."TftMatch" ("riotAccountId");

CREATE INDEX IF NOT EXISTS "TftMatch_matchId_idx"
    ON "public"."TftMatch" ("matchId");

CREATE UNIQUE INDEX IF NOT EXISTS "TftMatch_riotAccountId_matchId_key"
    ON "public"."TftMatch" ("riotAccountId", "matchId");

COMMIT;
