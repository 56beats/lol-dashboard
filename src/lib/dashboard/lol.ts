import { prisma } from "@/lib/prisma";
import { resolveDdragonVersion } from "@/lib/ddragon/shared";
import { comparePatchVersions } from "@/lib/dashboard/patch";

export type LolPeriod = "recent20" | "7d" | "30d" | "all";

type LolMatchForDisplay = {
  id: string;
  champion: string;
  championJa: string;
  championId: number;
  win: boolean;
  kills: number;
  deaths: number;
  assists: number;
  gameMode: string;
  queueId: number | null;
  patch: string;
  playedAt: Date;
  itemIds: number[];
  ddragonVersion: string;
  teamPosition: string | null;
  individualPosition: string | null;
  cs: number;
  damage: number;
  visionScore: number;
  participants: Array<{
    puuid: string;
    isMe: boolean;
    riotIdGameName: string | null;
    riotIdTagline: string | null;
    teamId: number;
    championName: string;
    championJa: string;
    championImageUrl?: string;
    kills: number;
    deaths: number;
    assists: number;
    totalMinionsKilled: number | null;
    neutralMinionsKilled: number | null;
    totalDamageDealtToChampions: number | null;
    visionScore: number | null;
    summoner1Id: number | null;
    summoner2Id: number | null;
    itemIds: number[];
  }>;
};

export type LolStats = {
  wins: number;
  losses: number;
  winRate: number;
  totalKills: number;
  totalDeaths: number;
  totalAssists: number;
  avgKda: string;
};

export type ChampionStat = {
  championId: number;
  championName: string;
  games: number;
  wins: number;
  losses: number;
  winRate: number;
  avgKda: string;
  avgKills: number;
  avgDeaths: number;
  avgAssists: number;
  avgCs: number;
  avgDamage: number;
};

export type RoleStat = {
  role: string;
  label: string;
  games: number;
  wins: number;
  losses: number;
  winRate: number;
  avgKda: string;
};

export type PatchStat = {
  patch: string;
  games: number;
  wins: number;
  losses: number;
  winRate: number;
  avgKda: string;
};

export type PatchComparisonStat = {
  patch: string;
  games: number;
  winRate: number;
  avgKda: string;
  avgKills: number;
  avgDeaths: number;
  avgAssists: number;
  avgCs: number;
  avgDamage: number;
  avgVisionScore: number;
};

export type PatchComparison = {
  latest: PatchComparisonStat | null;
  previous: PatchComparisonStat | null;
  message?: string;
};

function normalizeLolPeriod(period?: string): LolPeriod {
  if (period === "7d" || period === "30d" || period === "all") {
    return period;
  }

  return "recent20";
}

function filterMatchesByPeriod<T extends { playedAt: Date }>(
  matches: T[],
  period: LolPeriod
): T[] {
  if (period === "all") {
    return matches;
  }

  if (period === "recent20") {
    return matches.slice(0, 20);
  }

  const now = new Date();
  const cutoff = new Date(now);

  if (period === "7d") {
    cutoff.setDate(now.getDate() - 7);
  }

  if (period === "30d") {
    cutoff.setDate(now.getDate() - 30);
  }

  return matches.filter((match) => match.playedAt >= cutoff);
}

function formatAverage(value: number, digits = 2): number {
  return Number(value.toFixed(digits));
}

function formatKdaAverage(
  kills: number,
  deaths: number,
  assists: number
): string {
  if (deaths === 0) {
    return "Perfect";
  }

  return ((kills + assists) / deaths).toFixed(2);
}

function getRoleKey(
  teamPosition?: string | null,
  individualPosition?: string | null
) {
  const primary = teamPosition?.toUpperCase();
  const fallback = individualPosition?.toUpperCase();

  if (primary === "TOP" || fallback === "TOP") {
    return "TOP";
  }
  if (primary === "JUNGLE" || fallback === "JUNGLE") {
    return "JUNGLE";
  }
  if (primary === "MIDDLE" || fallback === "MIDDLE") {
    return "MIDDLE";
  }
  if (primary === "BOTTOM" || fallback === "BOTTOM") {
    return "BOTTOM";
  }
  if (primary === "UTILITY" || fallback === "UTILITY") {
    return "UTILITY";
  }

  return null;
}

export function getLolPeriodLabel(period: LolPeriod): string {
  switch (period) {
    case "7d":
      return "7日";
    case "30d":
      return "30日";
    case "all":
      return "全期間";
    default:
      return "最近20試合";
  }
}

/**
 * LoLマッチデータを取得し、表示用形式へ変換する
 */
export async function getLolMatchesForDisplay(
  myPuuid: string | null | undefined,
  period: string | LolPeriod = "recent20"
): Promise<LolMatchForDisplay[]> {
  if (!myPuuid) {
    return [];
  }

  const normalizedPeriod = normalizeLolPeriod(period);

  const lolMatches = await prisma.lolMatch.findMany({
    where: {
      participants: {
        some: {
          puuid: myPuuid,
        },
      },
    },
    orderBy: {
      playedAt: "desc",
    },
    include: {
      participants: {
        orderBy: [{ teamId: "asc" }, { participantId: "asc" }],
      },
    },
  });

  const filteredMatches = filterMatchesByPeriod(lolMatches, normalizedPeriod);

  const lolChampions = await prisma.lolChampion.findMany();
  const lolChampionMap = new Map(
    lolChampions.map((champion) => [champion.key, champion])
  );

  const matches = await Promise.all(
    filteredMatches.map(async (match) => {
      const me = match.participants.find(
        (participant) => participant.puuid === myPuuid
      );

      if (!me) {
        return null;
      }

      const champion = lolChampionMap.get(me.championId);
      const cs = (me.totalMinionsKilled ?? 0) + (me.neutralMinionsKilled ?? 0);

      return {
        id: match.matchId,
        champion: me.championName,
        championJa: champion?.nameJa ?? me.championName,
        championId: me.championId,
        win: me.win,
        kills: me.kills,
        deaths: me.deaths,
        assists: me.assists,
        gameMode: match.gameMode,
        queueId: match.queueId,
        patch: match.patch ?? "Unknown",
        playedAt: match.playedAt,
        itemIds: [
          me.item0 ?? 0,
          me.item1 ?? 0,
          me.item2 ?? 0,
          me.item3 ?? 0,
          me.item4 ?? 0,
          me.item5 ?? 0,
          me.item6 ?? 0,
        ],
        ddragonVersion: await resolveDdragonVersion(match.gameVersion),
        teamPosition: me.teamPosition,
        individualPosition: me.individualPosition,
        cs,
        damage: me.totalDamageDealtToChampions ?? 0,
        visionScore: me.visionScore ?? 0,
        participants: match.participants.map((participant) => {
          const participantChampion = lolChampionMap.get(
            participant.championId
          );

          return {
            puuid: participant.puuid,
            isMe: participant.puuid === myPuuid,
            riotIdGameName: participant.riotIdGameName,
            riotIdTagline: participant.riotIdTagline,
            teamId: participant.teamId,
            championName: participant.championName,
            championJa: participantChampion?.nameJa ?? participant.championName,
            championImageUrl: participantChampion?.imageUrl,
            kills: participant.kills,
            deaths: participant.deaths,
            assists: participant.assists,
            totalMinionsKilled: participant.totalMinionsKilled,
            neutralMinionsKilled: participant.neutralMinionsKilled,
            totalDamageDealtToChampions:
              participant.totalDamageDealtToChampions,
            visionScore: participant.visionScore,
            summoner1Id: participant.summoner1Id,
            summoner2Id: participant.summoner2Id,
            itemIds: [
              participant.item0 ?? 0,
              participant.item1 ?? 0,
              participant.item2 ?? 0,
              participant.item3 ?? 0,
              participant.item4 ?? 0,
              participant.item5 ?? 0,
              participant.item6 ?? 0,
            ],
          };
        }),
      };
    })
  ).then((matches) =>
    matches.filter(
      (match): match is NonNullable<typeof match> => match !== null
    )
  );

  return matches;
}

/**
 * LoLマッチデータから集計統計を計算する
 */
export function calculateLolStats(matches: LolMatchForDisplay[]): LolStats {
  const wins = matches.filter((m) => m.win).length;
  const losses = matches.length - wins;
  const winRate =
    matches.length > 0 ? Math.round((wins / matches.length) * 100) : 0;

  const totalKills = matches.reduce((sum, m) => sum + m.kills, 0);
  const totalDeaths = matches.reduce((sum, m) => sum + m.deaths, 0);
  const totalAssists = matches.reduce((sum, m) => sum + m.assists, 0);

  const avgKda =
    totalDeaths === 0
      ? "Perfect"
      : ((totalKills + totalAssists) / totalDeaths).toFixed(2);

  return {
    wins,
    losses,
    winRate,
    totalKills,
    totalDeaths,
    totalAssists,
    avgKda,
  };
}

export function calculateLolChampionStats(
  matches: LolMatchForDisplay[]
): ChampionStat[] {
  const statsByChampion = new Map<number, ChampionStat>();

  matches.forEach((match) => {
    const entry = statsByChampion.get(match.championId) ?? {
      championId: match.championId,
      championName: match.championJa || match.champion,
      games: 0,
      wins: 0,
      losses: 0,
      winRate: 0,
      avgKda: "0.00",
      avgKills: 0,
      avgDeaths: 0,
      avgAssists: 0,
      avgCs: 0,
      avgDamage: 0,
    };

    entry.games += 1;
    if (match.win) {
      entry.wins += 1;
    } else {
      entry.losses += 1;
    }

    entry.avgKills += match.kills;
    entry.avgDeaths += match.deaths;
    entry.avgAssists += match.assists;
    entry.avgCs += match.cs;
    entry.avgDamage += match.damage;

    statsByChampion.set(match.championId, entry);
  });

  return Array.from(statsByChampion.values())
    .map((stat) => {
      const games = stat.games;
      const winRate = games > 0 ? Math.round((stat.wins / games) * 100) : 0;

      return {
        ...stat,
        winRate,
        avgKda: formatKdaAverage(
          stat.avgKills / games,
          stat.avgDeaths / games,
          stat.avgAssists / games
        ),
        avgKills: formatAverage(stat.avgKills / games, 1),
        avgDeaths: formatAverage(stat.avgDeaths / games, 1),
        avgAssists: formatAverage(stat.avgAssists / games, 1),
        avgCs: formatAverage(stat.avgCs / games, 1),
        avgDamage: formatAverage(stat.avgDamage / games, 0),
      };
    })
    .sort((a, b) => {
      if (b.games !== a.games) {
        return b.games - a.games;
      }
      if (b.winRate !== a.winRate) {
        return b.winRate - a.winRate;
      }
      return a.championName.localeCompare(b.championName);
    })
    .slice(0, 5);
}

export function calculateLolRoleStats(
  matches: LolMatchForDisplay[]
): RoleStat[] {
  const statsByRole = new Map<string, RoleStat>();

  matches.forEach((match) => {
    const role = getRoleKey(match.teamPosition, match.individualPosition);

    if (!role) {
      return;
    }

    const entry = statsByRole.get(role) ?? {
      role,
      label: role,
      games: 0,
      wins: 0,
      losses: 0,
      winRate: 0,
      avgKda: "0.00",
    };

    entry.games += 1;
    if (match.win) {
      entry.wins += 1;
    } else {
      entry.losses += 1;
    }

    statsByRole.set(role, entry);
  });

  return Array.from(statsByRole.values())
    .map((stat) => {
      const games = stat.games;
      const winRate = games > 0 ? Math.round((stat.wins / games) * 100) : 0;
      const totalKills = matches
        .filter(
          (match) =>
            getRoleKey(match.teamPosition, match.individualPosition) ===
            stat.role
        )
        .reduce((sum, match) => sum + match.kills, 0);
      const totalDeaths = matches
        .filter(
          (match) =>
            getRoleKey(match.teamPosition, match.individualPosition) ===
            stat.role
        )
        .reduce((sum, match) => sum + match.deaths, 0);
      const totalAssists = matches
        .filter(
          (match) =>
            getRoleKey(match.teamPosition, match.individualPosition) ===
            stat.role
        )
        .reduce((sum, match) => sum + match.assists, 0);

      return {
        ...stat,
        winRate,
        avgKda:
          totalDeaths === 0
            ? "Perfect"
            : ((totalKills + totalAssists) / totalDeaths).toFixed(2),
      };
    })
    .filter((stat) => stat.games > 0)
    .sort((a, b) => {
      const aIndex = ["TOP", "JUNGLE", "MIDDLE", "BOTTOM", "UTILITY"].indexOf(
        a.role
      );
      const bIndex = ["TOP", "JUNGLE", "MIDDLE", "BOTTOM", "UTILITY"].indexOf(
        b.role
      );
      return (aIndex === -1 ? 99 : aIndex) - (bIndex === -1 ? 99 : bIndex);
    });
}

export function calculateLolPatchStats(
  matches: LolMatchForDisplay[]
): PatchStat[] {
  const statsByPatch = new Map<string, PatchStat>();

  matches.forEach((match) => {
    const patch = match.patch?.trim() || "Unknown";
    const entry = statsByPatch.get(patch) ?? {
      patch,
      games: 0,
      wins: 0,
      losses: 0,
      winRate: 0,
      avgKda: "0.00",
    };

    entry.games += 1;
    if (match.win) {
      entry.wins += 1;
    } else {
      entry.losses += 1;
    }

    statsByPatch.set(patch, entry);
  });

  return Array.from(statsByPatch.values())
    .map((stat) => {
      const games = stat.games;
      const winRate = games > 0 ? Math.round((stat.wins / games) * 100) : 0;
      const totalKills = matches
        .filter((match) => (match.patch?.trim() || "Unknown") === stat.patch)
        .reduce((sum, match) => sum + match.kills, 0);
      const totalDeaths = matches
        .filter((match) => (match.patch?.trim() || "Unknown") === stat.patch)
        .reduce((sum, match) => sum + match.deaths, 0);
      const totalAssists = matches
        .filter((match) => (match.patch?.trim() || "Unknown") === stat.patch)
        .reduce((sum, match) => sum + match.assists, 0);

      return {
        ...stat,
        winRate,
        avgKda:
          totalDeaths === 0
            ? "Perfect"
            : ((totalKills + totalAssists) / totalDeaths).toFixed(2),
      };
    })
    .sort((a, b) => comparePatchVersions(a.patch, b.patch))
    .slice(0, 5);
}

export function calculateLolPatchComparison(
  matches: LolMatchForDisplay[]
): PatchComparison {
  const patchStats = calculateLolPatchStats(matches);
  const sortedPatches = [...patchStats].sort((a, b) =>
    comparePatchVersions(a.patch, b.patch)
  );

  const latestPatch = sortedPatches[0]?.patch ?? null;
  const previousPatch = sortedPatches[1]?.patch ?? null;

  if (!latestPatch || !previousPatch) {
    return {
      latest: null,
      previous: null,
      message: "比較できる前パッチのデータがありません",
    };
  }

  const latestMatches = matches.filter(
    (match) => (match.patch?.trim() || "Unknown") === latestPatch
  );
  const previousMatches = matches.filter(
    (match) => (match.patch?.trim() || "Unknown") === previousPatch
  );

  const buildComparisonStat = (
    patch: string,
    patchMatches: LolMatchForDisplay[]
  ): PatchComparisonStat => {
    const games = patchMatches.length;
    const totalKills = patchMatches.reduce(
      (sum, match) => sum + match.kills,
      0
    );
    const totalDeaths = patchMatches.reduce(
      (sum, match) => sum + match.deaths,
      0
    );
    const totalAssists = patchMatches.reduce(
      (sum, match) => sum + match.assists,
      0
    );
    const totalCs = patchMatches.reduce((sum, match) => sum + match.cs, 0);
    const totalDamage = patchMatches.reduce(
      (sum, match) => sum + match.damage,
      0
    );
    const totalVisionScore = patchMatches.reduce(
      (sum, match) => sum + match.visionScore,
      0
    );

    return {
      patch,
      games,
      winRate:
        games > 0
          ? Math.round(
              (patchMatches.filter((match) => match.win).length / games) * 100
            )
          : 0,
      avgKda:
        totalDeaths === 0
          ? "Perfect"
          : ((totalKills + totalAssists) / totalDeaths).toFixed(2),
      avgKills: formatAverage(totalKills / games, 1),
      avgDeaths: formatAverage(totalDeaths / games, 1),
      avgAssists: formatAverage(totalAssists / games, 1),
      avgCs: formatAverage(totalCs / games, 1),
      avgDamage: formatAverage(totalDamage / games, 0),
      avgVisionScore: formatAverage(totalVisionScore / games, 1),
    };
  };

  return {
    latest: buildComparisonStat(latestPatch, latestMatches),
    previous: buildComparisonStat(previousPatch, previousMatches),
  };
}
