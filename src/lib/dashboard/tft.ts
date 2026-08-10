import { prisma } from "@/lib/prisma";
import { getTftDisplayMaps } from "@/lib/ddragon/tftDisplay";
import { calculateRankScore, formatShortRankWithLp } from "@/lib/rank";
import { comparePatchVersions } from "@/lib/dashboard/patch";
import type { TftTrait, TftUnit } from "@/types/tft";
import type { LolPeriod } from "@/lib/dashboard/lol";

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
  fallbackImageUrl?: string;
  items: TftDisplayItem[];
};

export type TftMatchForDisplay = {
  id: string;
  placement: number;
  level: number;
  playedAt: Date;
  patch: string;
  augments: TftDisplayItem[];
  traits: TftDisplayTrait[];
  units: TftDisplayUnit[];
};

export type TftStats = {
  averagePlacement: string;
  top4Count: number;
  top4Rate: number;
};

export type TftTraitStat = {
  traitId: string;
  traitName: string;
  games: number;
  averagePlacement: number;
  top4Count: number;
  top4Rate: number;
  firstCount: number;
  firstRate: number;
};

export type TftUnitStat = {
  unitId: string;
  unitName: string;
  games: number;
  averagePlacement: number;
  top4Rate: number;
  averageTier: number;
  threeStarCount: number;
  threeStarRate: number;
};

export type TftAugmentStat = {
  augmentId: string;
  augmentName: string;
  games: number;
  averagePlacement: number;
  top4Rate: number;
  firstRate: number;
};

export type TftPatchStat = {
  patch: string;
  games: number;
  averagePlacement: number;
  top4Rate: number;
  firstRate: number;
};

export type TftPatchComparisonStat = {
  patch: string;
  games: number;
  averagePlacement: number;
  top4Rate: number;
  firstRate: number;
};

export type TftPatchComparison = {
  latest: TftPatchComparisonStat | null;
  previous: TftPatchComparisonStat | null;
  message?: string;
};

type RankChartData = {
  date: string;
  score: number;
  label: string;
};

function normalizeTftPeriod(period?: string): LolPeriod {
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

export function getTftPeriodLabel(period: LolPeriod): string {
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
 * TFTマッチデータを取得し、表示用形式へ変換する
 */
export async function getTftMatchesForDisplay(
  period: string | LolPeriod = "recent20"
): Promise<TftMatchForDisplay[]> {
  const tftMatches = await prisma.tftMatch.findMany({
    orderBy: {
      playedAt: "desc",
    },
  });

  const filteredMatches = filterMatchesByPeriod(
    tftMatches,
    normalizeTftPeriod(period)
  );

  // DBに同期済みのCommunityDragon画像付きTFTチャンピオン一覧
  const tftChampions = await prisma.tftChampion.findMany();
  const tftChampionMap = new Map(
    tftChampions.map((champion) => [champion.id, champion])
  );

  // DDragon API取得失敗時は空マップで継続する
  // 以降の各エンティティ変換にある既存フォールバック（?? 演算子）が内部IDを代替表示する
  let tftDisplayMaps: Awaited<ReturnType<typeof getTftDisplayMaps>>;
  try {
    tftDisplayMaps = await getTftDisplayMaps();
  } catch (error) {
    // エラーを握りつぶさずサーバーログへ出力する（調査可能にするため）
    console.error(
      "[TFTダッシュボード] DDragon取得失敗（空マップで継続）:",
      error instanceof Error ? error.message : "Unknown"
    );
    tftDisplayMaps = { champions: {}, traits: {}, augments: {}, items: {} };
  }

  return filteredMatches.map((match) => ({
    id: match.id,
    placement: match.placement,
    level: match.level,
    playedAt: match.playedAt,
    patch: match.id ? "Unknown" : "Unknown",

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
    units: (match.units as TftUnit[]).map((unit) => {
      const dbChampion = tftChampionMap.get(unit.id);
      // CDragonを優先。DBになければDDragonマップを使う（既存ロジック維持）
      const imageUrl =
        dbChampion?.imageUrl ?? tftDisplayMaps.champions[unit.id]?.imageUrl;
      // DBにチャンピオン情報がある場合のみ、CDragonが404になったときのDDragonフォールバックを設定する
      // DBの ddragonImageUrl が優先。なければDDragonマップのURLを使う
      const fallbackImageUrl =
        dbChampion !== undefined
          ? (dbChampion.ddragonImageUrl ??
            tftDisplayMaps.champions[unit.id]?.imageUrl)
          : undefined;

      return {
        ...unit,
        name:
          dbChampion?.name ??
          tftDisplayMaps.champions[unit.id]?.name ??
          unit.id,
        imageUrl,
        fallbackImageUrl: fallbackImageUrl ?? undefined,
        items: unit.itemIds.map((itemId) => ({
          ...(tftDisplayMaps.items[itemId] ?? {
            id: itemId,
            name: itemId,
          }),
        })),
      };
    }),
  }));
}

/**
 * TFTマッチデータから集計統計を計算する
 */
export function calculateTftStats(matches: TftMatchForDisplay[]): TftStats {
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

export function calculateTftTraitStats(
  matches: TftMatchForDisplay[]
): TftTraitStat[] {
  const statsByTrait = new Map<string, TftTraitStat>();

  matches.forEach((match) => {
    const seen = new Set<string>();
    match.traits.forEach((trait) => {
      if (seen.has(trait.id)) {
        return;
      }
      seen.add(trait.id);

      const entry = statsByTrait.get(trait.id) ?? {
        traitId: trait.id,
        traitName: trait.name,
        games: 0,
        averagePlacement: 0,
        top4Count: 0,
        top4Rate: 0,
        firstCount: 0,
        firstRate: 0,
      };

      entry.games += 1;
      entry.averagePlacement += match.placement;
      if (match.placement <= 4) {
        entry.top4Count += 1;
      }
      if (match.placement === 1) {
        entry.firstCount += 1;
      }

      statsByTrait.set(trait.id, entry);
    });
  });

  return Array.from(statsByTrait.values())
    .map((stat) => {
      const games = stat.games;
      return {
        ...stat,
        averagePlacement:
          games > 0 ? Number((stat.averagePlacement / games).toFixed(1)) : 0,
        top4Rate: games > 0 ? Math.round((stat.top4Count / games) * 100) : 0,
        firstRate: games > 0 ? Math.round((stat.firstCount / games) * 100) : 0,
      };
    })
    .sort((a, b) => {
      if (b.games !== a.games) {
        return b.games - a.games;
      }
      if (a.averagePlacement !== b.averagePlacement) {
        return a.averagePlacement - b.averagePlacement;
      }
      return a.traitName.localeCompare(b.traitName);
    })
    .slice(0, 10);
}

export function calculateTftUnitStats(
  matches: TftMatchForDisplay[]
): TftUnitStat[] {
  const statsByUnit = new Map<string, TftUnitStat>();

  matches.forEach((match) => {
    const seen = new Set<string>();
    match.units.forEach((unit) => {
      if (seen.has(unit.id)) {
        return;
      }
      seen.add(unit.id);

      const entry = statsByUnit.get(unit.id) ?? {
        unitId: unit.id,
        unitName: unit.name,
        games: 0,
        averagePlacement: 0,
        top4Rate: 0,
        averageTier: 0,
        threeStarCount: 0,
        threeStarRate: 0,
      };

      entry.games += 1;
      entry.averagePlacement += match.placement;
      if (match.placement <= 4) {
        entry.top4Rate += 1;
      }
      entry.averageTier += unit.tier;
      if (unit.tier >= 3) {
        entry.threeStarCount += 1;
      }

      statsByUnit.set(unit.id, entry);
    });
  });

  return Array.from(statsByUnit.values())
    .map((stat) => {
      const games = stat.games;
      return {
        ...stat,
        averagePlacement:
          games > 0 ? Number((stat.averagePlacement / games).toFixed(1)) : 0,
        top4Rate: games > 0 ? Math.round((stat.top4Rate / games) * 100) : 0,
        averageTier:
          games > 0 ? Number((stat.averageTier / games).toFixed(1)) : 0,
        threeStarRate:
          games > 0 ? Math.round((stat.threeStarCount / games) * 100) : 0,
      };
    })
    .sort((a, b) => {
      if (b.games !== a.games) {
        return b.games - a.games;
      }
      if (a.averagePlacement !== b.averagePlacement) {
        return a.averagePlacement - b.averagePlacement;
      }
      return a.unitName.localeCompare(b.unitName);
    })
    .slice(0, 10);
}

export function calculateTftAugmentStats(
  matches: TftMatchForDisplay[]
): TftAugmentStat[] {
  const statsByAugment = new Map<string, TftAugmentStat>();

  matches.forEach((match) => {
    match.augments.forEach((augment) => {
      const entry = statsByAugment.get(augment.id) ?? {
        augmentId: augment.id,
        augmentName: augment.name,
        games: 0,
        averagePlacement: 0,
        top4Rate: 0,
        firstRate: 0,
      };

      entry.games += 1;
      entry.averagePlacement += match.placement;
      if (match.placement <= 4) {
        entry.top4Rate += 1;
      }
      if (match.placement === 1) {
        entry.firstRate += 1;
      }

      statsByAugment.set(augment.id, entry);
    });
  });

  return Array.from(statsByAugment.values())
    .map((stat) => {
      const games = stat.games;
      return {
        ...stat,
        averagePlacement:
          games > 0 ? Number((stat.averagePlacement / games).toFixed(1)) : 0,
        top4Rate: games > 0 ? Math.round((stat.top4Rate / games) * 100) : 0,
        firstRate: games > 0 ? Math.round((stat.firstRate / games) * 100) : 0,
      };
    })
    .sort((a, b) => {
      if (b.games !== a.games) {
        return b.games - a.games;
      }
      if (a.averagePlacement !== b.averagePlacement) {
        return a.averagePlacement - b.averagePlacement;
      }
      return a.augmentName.localeCompare(b.augmentName);
    })
    .slice(0, 10);
}

export function calculateTftPatchStats(
  matches: TftMatchForDisplay[]
): TftPatchStat[] {
  const statsByPatch = new Map<string, TftPatchStat>();

  matches.forEach((match) => {
    const patch = match.patch || "Unknown";
    const entry = statsByPatch.get(patch) ?? {
      patch,
      games: 0,
      averagePlacement: 0,
      top4Rate: 0,
      firstRate: 0,
    };

    entry.games += 1;
    entry.averagePlacement += match.placement;
    if (match.placement <= 4) {
      entry.top4Rate += 1;
    }
    if (match.placement === 1) {
      entry.firstRate += 1;
    }

    statsByPatch.set(patch, entry);
  });

  return Array.from(statsByPatch.values())
    .map((stat) => {
      const games = stat.games;
      return {
        ...stat,
        averagePlacement:
          games > 0 ? Number((stat.averagePlacement / games).toFixed(1)) : 0,
        top4Rate: games > 0 ? Math.round((stat.top4Rate / games) * 100) : 0,
        firstRate: games > 0 ? Math.round((stat.firstRate / games) * 100) : 0,
      };
    })
    .sort((a, b) => comparePatchVersions(a.patch, b.patch))
    .slice(0, 5);
}

export function calculateTftPatchComparison(
  matches: TftMatchForDisplay[]
): TftPatchComparison {
  const patchStats = calculateTftPatchStats(matches);
  const sortedPatches = [...patchStats].sort((a, b) =>
    comparePatchVersions(a.patch, b.patch)
  );

  const latest = sortedPatches[0] ?? null;
  const previous = sortedPatches[1] ?? null;

  if (!latest || !previous) {
    return {
      latest,
      previous,
      message: "比較できる前パッチのデータがありません",
    };
  }

  return {
    latest,
    previous,
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
