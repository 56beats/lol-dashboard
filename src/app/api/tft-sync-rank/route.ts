import { prisma } from "@/lib/prisma";
import { getAccount } from "@/lib/riot";
import { getTftLeagueEntriesByPuuid } from "@/lib/tft/rank";

/**
 * TFTランク情報を取得して保存する
 *
 * Riot APIは複数キューのランク情報を配列で返すため、
 * その中から通常のTFTランクを探して保存する。
 */
export async function GET(request: Request) {
  const account = await getAccount();

  const entries = await getTftLeagueEntriesByPuuid(account.puuid);

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

  return Response.redirect(new URL("/", request.url));
}
