import { prisma } from "@/lib/prisma";
import { getConfiguredPuuid } from "@/lib/sync/appConfig";
import { getLeagueEntriesByPuuid } from "@/lib/riot";
import type { RiotLeagueEntry } from "@/types/riot";
import { extractRankValues, hasRankChanged, type RankValues } from "@/lib/sync/rank/shared";

/**
 * LoL ランク情報を同期してDB保存する
 * 前回と比較して変化がある場合だけ保存
 */
export async function syncLolRank(): Promise<{ changed: boolean }> {
  // Account APIはsync-profileだけで呼ぶ。ランク同期ではDBに保存済みのPUUIDを使う
  const puuid = await getConfiguredPuuid();
  const entries = await getLeagueEntriesByPuuid(puuid);

  // Solo/Duo のみ保存対象
  const soloQueue = entries.find(
    (entry) => entry.queueType === "RANKED_SOLO_5x5"
  ) as RiotLeagueEntry | undefined;

  if (!soloQueue) {
    return { changed: false };
  }

  // 直近のランクスナップショットを取得
  const latest = await prisma.rankSnapshot.findFirst({
    where: {
      queue: soloQueue.queueType,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // 現在と前回のランク値を取得して比較
  const currentValues = extractRankValues(soloQueue);
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

  await prisma.rankSnapshot.create({
    data: {
      queue: soloQueue.queueType,
      ...currentValues,
    },
  });

  return { changed: true };
}
