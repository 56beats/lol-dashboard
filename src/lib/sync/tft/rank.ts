import { prisma } from "@/lib/prisma";
import { getConfiguredPuuid } from "@/lib/sync/appConfig";
import { getTftLeagueEntriesByPuuid } from "@/lib/tft/rank";
import type { RiotLeagueEntry } from "@/types/riot";
import { extractRankValues, hasRankChanged, type RankValues } from "@/lib/sync/rank/shared";

/**
 * TFT 繝ｩ繝ｳ繧ｯ諠・ｱ繧貞酔譛溘＠縺ｦDB菫晏ｭ倥☆繧・
 * 蜑榊屓縺ｨ豈碑ｼ・＠縺ｦ螟牙喧縺後≠繧句ｴ蜷医□縺台ｿ晏ｭ・
 */
export async function syncTftRank(): Promise<{ changed: boolean }> {
  // TFT隧ｦ蜷亥酔譛溘〒縺ｯAccount API繧貞他縺ｰ縺壹、ppConfig縺ｮPUUID繧剃ｽｿ縺・
  const puuid = await getConfiguredPuuid();
  const entries = await getTftLeagueEntriesByPuuid(puuid);

  // TFT騾壼ｸｸ繝ｩ繝ｳ繧ｯ繧剃ｿ晏ｭ伜ｯｾ雎｡縺ｫ縺吶ｋ
  const rankedTft = entries.find(
    (entry) => entry.queueType === "RANKED_TFT"
  ) as RiotLeagueEntry | undefined;

  if (!rankedTft) {
    return { changed: false };
  }

  // 逶ｴ霑代・繝ｩ繝ｳ繧ｯ繧ｹ繝翫ャ繝励す繝ｧ繝・ヨ繧貞叙蠕・
  const latest = await prisma.tftRankSnapshot.findFirst({
    where: {
      queue: rankedTft.queueType,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // 迴ｾ蝨ｨ縺ｨ蜑榊屓縺ｮ繝ｩ繝ｳ繧ｯ蛟､繧貞叙蠕励＠縺ｦ豈碑ｼ・
  const currentValues = extractRankValues(rankedTft);
  // DB縺九ｉ霑斐＆繧後◆蛟､縺ｯ譌｢縺ｫRankValues縺ｮ蠖｢迥ｶ・・ier, rank, lp, wins, losses・・
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

