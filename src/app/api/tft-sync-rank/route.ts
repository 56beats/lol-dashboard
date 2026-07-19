import { prisma } from "@/lib/prisma";
import {
  getConfiguredPuuid,
  updateLastTftRankSync,
} from "@/lib/sync/appConfig";
import { getTftLeagueEntriesByPuuid } from "@/lib/tft/rank";

/**
 * TFTランク情報を取得して保存する
 *
 * Riot APIは複数キューのランク情報を配列で返すため、
 * その中から通常のTFTランクを探して保存する。
 */
export async function GET(request: Request) {
  // TFT試合同期ではAccount APIを呼ばず、AppConfigのPUUIDを使う
  const puuid = await getConfiguredPuuid();

  const entries = await getTftLeagueEntriesByPuuid(puuid);

  // TFT通常ランクを保存対象にする
  const rankedTft = entries.find(
    (entry: any) => entry.queueType === "RANKED_TFT"
  );

  if (!rankedTft) {
    return Response.redirect(new URL("/", request.url));
  }

  const latest = await prisma.tftRankSnapshot.findFirst({
    where: {
      queue: rankedTft.queueType,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const isSame =
    latest &&
    latest.tier === rankedTft.tier &&
    latest.rank === rankedTft.rank &&
    latest.lp === rankedTft.leaguePoints &&
    latest.wins === rankedTft.wins &&
    latest.losses === rankedTft.losses;

  // 前回と変化がある場合だけ保存する
  if (!isSame) {
    await prisma.tftRankSnapshot.create({
      data: {
        queue: rankedTft.queueType,
        tier: rankedTft.tier,
        rank: rankedTft.rank,
        lp: rankedTft.leaguePoints,
        wins: rankedTft.wins,
        losses: rankedTft.losses,
      },
    });
  }

  await updateLastTftRankSync();
  return Response.redirect(new URL("/", request.url));
}
