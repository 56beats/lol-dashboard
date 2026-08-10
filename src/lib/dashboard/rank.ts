import { prisma } from "@/lib/prisma";
import type { LolPeriod } from "@/lib/dashboard/lol";
import { calculateRankScore, formatShortRankWithLp } from "@/lib/rank";

type RankChartData = {
  date: string;
  score: number;
  label: string;
};

function isRankSnapshotInPeriod(createdAt: Date, period: LolPeriod): boolean {
  const now = new Date();

  if (period === "all") {
    return true;
  }

  if (period === "recent20") {
    return true;
  }

  const cutoff = new Date(now);

  if (period === "7d") {
    cutoff.setDate(now.getDate() - 7);
  }

  if (period === "30d") {
    cutoff.setDate(now.getDate() - 30);
  }

  return createdAt >= cutoff;
}

/**
 * LoLランク履歴を取得し、グラフ表示用へ変換する
 */
export async function getLolRankChartData(
  accountId?: string
): Promise<RankChartData[]> {
  const rankHistory = await prisma.rankSnapshot.findMany({
    where: accountId
      ? {
          riotAccountId: accountId,
        }
      : {},
    orderBy: {
      createdAt: "asc",
    },
    take: 30,
  });

  return rankHistory.map((rank) => ({
    date: rank.createdAt.toLocaleDateString("ja-JP", {
      month: "numeric",
      day: "numeric",
    }),
    score: calculateRankScore(rank.tier, rank.rank, rank.lp),
    label: formatShortRankWithLp(rank.tier, rank.rank, rank.lp),
  }));
}

/**
 * 最新LoLランクと前回ランクを取得する
 */
export async function getLolRankHistory(
  period: LolPeriod = "recent20",
  accountId?: string
) {
  const rankHistory = await prisma.rankSnapshot.findMany({
    where: accountId
      ? {
          riotAccountId: accountId,
        }
      : {},
    orderBy: {
      createdAt: "asc",
    },
    take: 30,
  });

  const filteredHistory = rankHistory.filter((snapshot) =>
    isRankSnapshotInPeriod(snapshot.createdAt, period)
  );

  const latestRank = filteredHistory.at(-1);
  const previousRank = filteredHistory.at(-2);

  return {
    latestRank,
    previousRank,
    history: filteredHistory,
  };
}

/**
 * LoLランクスコア差分を計算する
 */
export function calculateLolRankLpDiff(
  latestRank: { tier: string; rank: string; lp: number } | undefined,
  previousRank: { tier: string; rank: string; lp: number } | undefined
): number | undefined {
  if (!latestRank || !previousRank) {
    return undefined;
  }

  return (
    calculateRankScore(latestRank.tier, latestRank.rank, latestRank.lp) -
    calculateRankScore(previousRank.tier, previousRank.rank, previousRank.lp)
  );
}

export function calculateLolRankLpDiffForPeriod(
  history: Array<{ tier: string; rank: string; lp: number }> | undefined
): number | undefined {
  if (!history || history.length < 2) {
    return undefined;
  }

  const startRank = history[0];
  const endRank = history[history.length - 1];

  if (!startRank || !endRank) {
    return undefined;
  }

  return (
    calculateRankScore(endRank.tier, endRank.rank, endRank.lp) -
    calculateRankScore(startRank.tier, startRank.rank, startRank.lp)
  );
}
