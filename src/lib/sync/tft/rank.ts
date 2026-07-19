import { prisma } from "@/lib/prisma";
import { getConfiguredPuuid } from "@/lib/sync/appConfig";
import { getTftLeagueEntriesByPuuid } from "@/lib/tft/rank";
import type { RiotLeagueEntry } from "@/types/riot";
import { extractRankValues, hasRankChanged, type RankValues } from "@/lib/sync/rank/shared";

/**
 * TFT ランク情報を同期してDB保存する
 * 前回と比較して変化がある場合だけ保存
 */
export async function syncTftRank(): Promise<{ changed: boolean }> {
  // TFT試合同期ではAccount APIを呼ばず、AppConfigのPUUIDを使う
  const puuid = await getConfiguredPuuid();
  const entries = await getTftLeagueEntriesByPuuid(puuid);

  // TFT通常ランクを保存対象にする
  const rankedTft = entries.find(
    (entry) => entry.queueType === "RANKED_TFT"
  ) as RiotLeagueEntry | undefined;

  if (!rankedTft) {
    return { changed: false };
  }

  // 直近のランクスナップショットを取得
  const latest = await prisma.tftRankSnapshot.findFirst({
    where: {
      queue: rankedTft.queueType,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // 現在と前回のランク値を取得して比較
  const currentValues = extractRankValues(rankedTft);
  // DBから返された値は既にRankValuesの形状（tier, rank, lp, wins, losses）
  const previousValues = latest
    ? ({
        tier: latest.tier,
        rank: latest.rank,
        lp: latest.lp,
        wins: latest.wins,
        losses: latest.losses,
      } as RankValues)
    : null;

  if (!hasRankChanged(currentValues, previousValues)) {
    return { changed: false };
  }

  await prisma.tftRankSnapshot.create({
    data: {
      queue: rankedTft.queueType,
      ...currentValues,
    },
  });

  return { changed: true };
}
