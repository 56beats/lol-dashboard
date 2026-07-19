import { prisma } from "@/lib/prisma";
import { calculateRankScore, formatShortRankWithLp } from "@/lib/rank";

type RankChartData = {
  date: string;
  score: number;
  label: string;
};

/**
 * LoLランク履歴を取得し、グラフ表示用へ変換する
 */
export async function getLolRankChartData(): Promise<RankChartData[]> {
  const rankHistory = await prisma.rankSnapshot.findMany({
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
export async function getLolRankHistory() {
  const rankHistory = await prisma.rankSnapshot.findMany({
    orderBy: {
      createdAt: "asc",
    },
    take: 30,
  });

  return {
    latestRank: rankHistory.at(-1),
    previousRank: rankHistory.at(-2),
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
