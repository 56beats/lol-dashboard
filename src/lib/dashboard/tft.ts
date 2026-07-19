import { prisma } from "@/lib/prisma";
import { getTftDisplayMaps } from "@/lib/ddragon/tftDisplay";
import { calculateRankScore, formatShortRankWithLp } from "@/lib/rank";
import type { TftTrait, TftUnit } from "@/types/tft";

type TftDisplayItem = {
  id: string;
  name: string;
  imageUrl?: string;
};

type TftDisplayTrait = TftTrait & {
  name: string;
  imageUrl?: string;
};

type TftDisplayUnit = TftUnit & {
  name: string;
  imageUrl?: string;
  items: TftDisplayItem[];
};

type TftMatchForDisplay = {
  id: string;
  placement: number;
  level: number;
  playedAt: Date;
  augments: TftDisplayItem[];
  traits: TftDisplayTrait[];
  units: TftDisplayUnit[];
};

type TftStats = {
  averagePlacement: string;
  top4Count: number;
  top4Rate: number;
};

type RankChartData = {
  date: string;
  score: number;
  label: string;
};

/**
 * TFTマッチデータを取得し、表示用形式へ変換する
 *
 * DBからマッチ情報を取得し、
 * Data Dragonを使用して日本語名・画像URLへ変換する。
 */
export async function getTftMatchesForDisplay(): Promise<TftMatchForDisplay[]> {
  const tftMatches = await prisma.tftMatch.findMany({
    orderBy: {
      playedAt: "desc",
    },
    take: 20,
  });

  // DBに同期済みのCommunityDragon画像付きTFTチャンピオン一覧
  const tftChampions = await prisma.tftChampion.findMany();
  const tftChampionMap = new Map(
    tftChampions.map((champion) => [champion.id, champion])
  );

  const tftDisplayMaps = await getTftDisplayMaps();

  return tftMatches.map((match) => ({
    id: match.id,
    placement: match.placement,
    level: match.level,
    playedAt: match.playedAt,

    augments: (match.augments as string[]).map(
      (id) => tftDisplayMaps.augments[id] ?? { id, name: id }
    ),

    traits: (match.traits as TftTrait[])
      .map((trait) => ({
        ...trait,
        name: tftDisplayMaps.traits[trait.id]?.name ?? trait.id,
        imageUrl: tftDisplayMaps.traits[trait.id]?.imageUrl,
      }))
      .sort((a, b) => {
        const aStyle = a.style ?? 0;
        const bStyle = b.style ?? 0;
        // ティア順で比較
        if (aStyle !== bStyle) {
          return bStyle - aStyle;
        }
        // 同じティアなら発動数順で比較
        return b.numUnits - a.numUnits;
      }),

    // TFTユニット情報を画面表示用へ変換
    // DBにはIDのみ保存されているため、Data Dragonで名前・画像に変換
    units: (match.units as TftUnit[]).map((unit) => ({
      ...unit,
      name:
        tftChampionMap.get(unit.id)?.name ??
        tftDisplayMaps.champions[unit.id]?.name ??
        unit.id,
      imageUrl:
        tftChampionMap.get(unit.id)?.imageUrl ??
        tftDisplayMaps.champions[unit.id]?.imageUrl,
      items: unit.itemIds.map((itemId) => ({
        ...(tftDisplayMaps.items[itemId] ?? {
          id: itemId,
          name: itemId,
        }),
      })),
    })),
  }));
}

/**
 * TFTマッチデータから集計統計を計算する
 */
export function calculateTftStats(
  matches: TftMatchForDisplay[]
): TftStats {
  const averagePlacement =
    matches.length > 0
      ? (
          matches.reduce((sum, match) => sum + match.placement, 0) /
          matches.length
        ).toFixed(2)
      : "-";

  const top4Count = matches.filter((match) => match.placement <= 4).length;
  const top4Rate =
    matches.length > 0 ? Math.round((top4Count / matches.length) * 100) : 0;

  return {
    averagePlacement,
    top4Count,
    top4Rate,
  };
}

/**
 * TFTランク履歴を取得し、グラフ表示用へ変換する
 */
export async function getTftRankChartData(): Promise<RankChartData[]> {
  const tftRankHistory = await prisma.tftRankSnapshot.findMany({
    orderBy: {
      createdAt: "asc",
    },
    take: 30,
  });

  return tftRankHistory.map((rank) => ({
    date: rank.createdAt.toLocaleDateString("ja-JP", {
      month: "numeric",
      day: "numeric",
    }),
    score: calculateRankScore(rank.tier, rank.rank, rank.lp),
    label: formatShortRankWithLp(rank.tier, rank.rank, rank.lp),
  }));
}

/**
 * 最新TFTランクデータを取得する
 */
export async function getLatestTftRank() {
  const tftRankHistory = await prisma.tftRankSnapshot.findMany({
    orderBy: {
      createdAt: "asc",
    },
    take: 30,
  });

  return tftRankHistory.at(-1);
}
