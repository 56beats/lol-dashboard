import { prisma } from "@/lib/prisma";
import { riotFetch } from "@/lib/riot/shared";
import { resolvePatch, toDate } from "@/lib/lol/match";
import { getConfiguredPuuid, updateLastMatchSync } from "@/lib/sync/appConfig";
import type { RiotMatchDetail } from "@/types/riot";

// JPサーバーの試合詳細はASIA routingを使う
const RIOT_REGION = "asia";

/**
 * PUUIDから直近のmatchId一覧を取得する
 */
async function fetchMatchIds(puuid: string) {
  const url =
    `https://${RIOT_REGION}.api.riotgames.com/lol/match/v5/matches/by-puuid/` +
    `${puuid}/ids?start=0&count=20`;

  return riotFetch<string[]>(url, "lol");
}

/**
 * matchIdから試合詳細を取得する
 */
async function fetchMatchDetail(matchId: string) {
  const url = `https://${RIOT_REGION}.api.riotgames.com/lol/match/v5/matches/${matchId}`;

  return riotFetch<RiotMatchDetail>(url, "lol");
}

/**
 * Riotの試合詳細をDBへ保存する
 */
async function saveMatchDetail(match: RiotMatchDetail) {
  const matchId = match.metadata.matchId;
  const info = match.info;
  const patch = resolvePatch(info.gameVersion);

  await prisma.lolMatch.upsert({
    where: {
      matchId,
    },
    update: {
      gameCreation: info.gameCreation ? BigInt(info.gameCreation) : null,
      gameStartTimestamp: info.gameStartTimestamp
        ? BigInt(info.gameStartTimestamp)
        : null,
      gameEndTimestamp: info.gameEndTimestamp
        ? BigInt(info.gameEndTimestamp)
        : null,
      gameDuration: info.gameDuration ?? null,
      gameVersion: info.gameVersion,
      patch,
      queueId: info.queueId,
      gameMode: info.gameMode,
      playedAt: toDate(info.gameEndTimestamp ?? info.gameStartTimestamp),
    },
    create: {
      matchId,
      gameCreation: info.gameCreation ? BigInt(info.gameCreation) : null,
      gameStartTimestamp: info.gameStartTimestamp
        ? BigInt(info.gameStartTimestamp)
        : null,
      gameEndTimestamp: info.gameEndTimestamp
        ? BigInt(info.gameEndTimestamp)
        : null,
      gameDuration: info.gameDuration ?? null,
      gameVersion: info.gameVersion,
      patch,
      queueId: info.queueId,
      gameMode: info.gameMode,
      playedAt: toDate(info.gameEndTimestamp ?? info.gameStartTimestamp),
    },
  });

  await Promise.all(
    info.participants.map((p) =>
      prisma.lolParticipant.upsert({
        where: {
          matchId_puuid: {
            matchId,
            puuid: p.puuid,
          },
        },
        update: {
          riotIdGameName: p.riotIdGameName ?? null,
          riotIdTagline: p.riotIdTagline ?? null,
          participantId: p.participantId,
          teamId: p.teamId,
          championId: p.championId,
          championName: p.championName,
          teamPosition: p.teamPosition ?? null,
          individualPosition: p.individualPosition ?? null,
          win: p.win,
          kills: p.kills,
          deaths: p.deaths,
          assists: p.assists,
          champLevel: p.champLevel ?? null,
          goldEarned: p.goldEarned ?? null,
          totalMinionsKilled: p.totalMinionsKilled ?? null,
          neutralMinionsKilled: p.neutralMinionsKilled ?? null,
          totalDamageDealtToChampions: p.totalDamageDealtToChampions ?? null,
          totalDamageTaken: p.totalDamageTaken ?? null,
          visionScore: p.visionScore ?? null,
          wardsPlaced: p.wardsPlaced ?? null,
          wardsKilled: p.wardsKilled ?? null,
          summoner1Id: p.summoner1Id ?? null,
          summoner2Id: p.summoner2Id ?? null,
          item0: p.item0 ?? null,
          item1: p.item1 ?? null,
          item2: p.item2 ?? null,
          item3: p.item3 ?? null,
          item4: p.item4 ?? null,
          item5: p.item5 ?? null,
          item6: p.item6 ?? null,
        },
        create: {
          matchId,
          puuid: p.puuid,
          riotIdGameName: p.riotIdGameName ?? null,
          riotIdTagline: p.riotIdTagline ?? null,
          participantId: p.participantId,
          teamId: p.teamId,
          championId: p.championId,
          championName: p.championName,
          teamPosition: p.teamPosition ?? null,
          individualPosition: p.individualPosition ?? null,
          win: p.win,
          kills: p.kills,
          deaths: p.deaths,
          assists: p.assists,
          champLevel: p.champLevel ?? null,
          goldEarned: p.goldEarned ?? null,
          totalMinionsKilled: p.totalMinionsKilled ?? null,
          neutralMinionsKilled: p.neutralMinionsKilled ?? null,
          totalDamageDealtToChampions: p.totalDamageDealtToChampions ?? null,
          totalDamageTaken: p.totalDamageTaken ?? null,
          visionScore: p.visionScore ?? null,
          wardsPlaced: p.wardsPlaced ?? null,
          wardsKilled: p.wardsKilled ?? null,
          summoner1Id: p.summoner1Id ?? null,
          summoner2Id: p.summoner2Id ?? null,
          item0: p.item0 ?? null,
          item1: p.item1 ?? null,
          item2: p.item2 ?? null,
          item3: p.item3 ?? null,
          item4: p.item4 ?? null,
          item5: p.item5 ?? null,
          item6: p.item6 ?? null,
        },
      })
    )
  );

  await Promise.all(
    info.teams.map((team) =>
      prisma.lolTeam.upsert({
        where: {
          matchId_teamId: {
            matchId,
            teamId: team.teamId,
          },
        },
        update: {
          win: team.win,
          baronKills: team.objectives?.baron?.kills ?? null,
          dragonKills: team.objectives?.dragon?.kills ?? null,
          riftHeraldKills: team.objectives?.riftHerald?.kills ?? null,
          towerKills: team.objectives?.tower?.kills ?? null,
          inhibitorKills: team.objectives?.inhibitor?.kills ?? null,
          firstBlood: team.objectives?.champion?.first ?? null,
          firstTower: team.objectives?.tower?.first ?? null,
          firstDragon: team.objectives?.dragon?.first ?? null,
        },
        create: {
          matchId,
          teamId: team.teamId,
          win: team.win,
          baronKills: team.objectives?.baron?.kills ?? null,
          dragonKills: team.objectives?.dragon?.kills ?? null,
          riftHeraldKills: team.objectives?.riftHerald?.kills ?? null,
          towerKills: team.objectives?.tower?.kills ?? null,
          inhibitorKills: team.objectives?.inhibitor?.kills ?? null,
          firstBlood: team.objectives?.champion?.first ?? null,
          firstTower: team.objectives?.tower?.first ?? null,
          firstDragon: team.objectives?.dragon?.first ?? null,
        },
      })
    )
  );
}

/**
 * LoL試合データの同期メイン処理
 *
 * - AppConfigのPUUIDを使用
 * - Riot APIで最新の試合ID一覧を取得
 * - DBに未保存の試合だけ詳細を取得＆保存
 * - 同期時刻を記録
 */
export async function syncLolMatches(accountId?: string | null) {
  const puuid = await getConfiguredPuuid(accountId);

  const matchIds = await fetchMatchIds(puuid);

  // まだDBに存在しない試合だけ保存する
  const existingMatches = await prisma.lolMatch.findMany({
    where: {
      matchId: {
        in: matchIds,
      },
    },
    select: {
      matchId: true,
    },
  });

  const existingMatchIdSet = new Set(
    existingMatches.map((match) => match.matchId)
  );

  const newMatchIds = matchIds.filter(
    (matchId) => !existingMatchIdSet.has(matchId)
  );

  for (const matchId of newMatchIds) {
    const detail = await fetchMatchDetail(matchId);
    await saveMatchDetail(detail);
  }

  await updateLastMatchSync(accountId);

  return {
    fetched: matchIds.length,
    saved: newMatchIds.length,
  };
}
