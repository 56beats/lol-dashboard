import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { resolvePatch, toDate } from "@/lib/lol/match";

const RIOT_API_KEY = process.env.RIOT_API_KEY;

// あなたのPUUIDをenvに置く想定
const PUUID = process.env.RIOT_PUUID;

// JPサーバーの試合詳細はASIA routingを使う
const RIOT_REGION = "asia";

type RiotMatchDetail = {
  metadata: {
    matchId: string;
  };
  info: {
    gameCreation?: number;
    gameStartTimestamp?: number;
    gameEndTimestamp?: number;
    gameDuration?: number;
    gameVersion: string;
    queueId: number;
    gameMode: string;
    participants: RiotParticipant[];
    teams: RiotTeam[];
  };
};

type RiotParticipant = {
  puuid: string;
  riotIdGameName?: string;
  riotIdTagline?: string;
  participantId: number;
  teamId: number;
  championId: number;
  championName: string;
  teamPosition?: string;
  individualPosition?: string;
  win: boolean;

  kills: number;
  deaths: number;
  assists: number;

  champLevel?: number;
  goldEarned?: number;
  totalMinionsKilled?: number;
  neutralMinionsKilled?: number;
  totalDamageDealtToChampions?: number;
  totalDamageTaken?: number;
  visionScore?: number;
  wardsPlaced?: number;
  wardsKilled?: number;

  summoner1Id?: number;
  summoner2Id?: number;

  item0?: number;
  item1?: number;
  item2?: number;
  item3?: number;
  item4?: number;
  item5?: number;
  item6?: number;
};

type RiotTeam = {
  teamId: number;
  win: boolean;
  objectives?: {
    baron?: { kills?: number; first?: boolean };
    dragon?: { kills?: number; first?: boolean };
    riftHerald?: { kills?: number; first?: boolean };
    tower?: { kills?: number; first?: boolean };
    inhibitor?: { kills?: number; first?: boolean };
    champion?: { first?: boolean };
  };
};

/**
 * Riot APIへリクエストする共通関数
 */
async function riotFetch<T>(url: string): Promise<T> {
  if (!RIOT_API_KEY) {
    throw new Error("RIOT_API_KEYが設定されていません");
  }

  const res = await fetch(url, {
    headers: {
      "X-Riot-Token": RIOT_API_KEY,
    },
    cache: "no-store",
  });

  if (!res.ok) {
    // Riot APIのエラー本文を確認できるようにする
    const errorText = await res.text();

    console.error("Riot API error", {
      status: res.status,
      url,
      errorText,
    });

    throw new Error(`Riot API request failed: ${res.status} ${errorText}`);
  }

  return res.json() as Promise<T>;
}

/**
 * PUUIDから直近のmatchId一覧を取得する
 */
async function fetchMatchIds() {
  if (!PUUID) {
    throw new Error("RIOT_PUUIDが設定されていません");
  }

  const url =
    `https://${RIOT_REGION}.api.riotgames.com/lol/match/v5/matches/by-puuid/` +
    `${PUUID}/ids?start=0&count=20`;

  return riotFetch<string[]>(url);
}

/**
 * matchIdから試合詳細を取得する
 */
async function fetchMatchDetail(matchId: string) {
  const url = `https://${RIOT_REGION}.api.riotgames.com/lol/match/v5/matches/${matchId}`;

  return riotFetch<RiotMatchDetail>(url);
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

export async function POST() {
  try {
    const matchIds = await fetchMatchIds();

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

    return NextResponse.json({
      ok: true,
      fetched: matchIds.length,
      saved: newMatchIds.length,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        ok: false,
        message: "LoL試合詳細の同期に失敗しました",
      },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  await POST();

  return Response.redirect(new URL("/", request.url));
}
