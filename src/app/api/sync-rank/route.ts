import { prisma } from "@/lib/prisma";
import { getAccount, getLeagueEntriesByPuuid } from "@/lib/riot";

/**
 * 現在のランク情報を取得してRankSnapshotに保存するAPI
 * 同じLP・同じランクなら保存しない
 */
export async function GET(request: Request) {
  const account = await getAccount();

  // PUUIDを使って現在のランク情報を取得する
  const entries = await getLeagueEntriesByPuuid(account.puuid);

  // まずはSolo/Duoだけ保存対象にする
  const soloQueue = entries.find(
    (entry: any) => entry.queueType === "RANKED_SOLO_5x5"
  );

  if (!soloQueue) {
    return Response.redirect(new URL("/", request.url));
  }

  // 直近のランクスナップショットを取得する
  const latest = await prisma.rankSnapshot.findFirst({
    where: {
      queue: soloQueue.queueType,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const isSameRank =
    latest &&
    latest.tier === soloQueue.tier &&
    latest.rank === soloQueue.rank &&
    latest.lp === soloQueue.leaguePoints &&
    latest.wins === soloQueue.wins &&
    latest.losses === soloQueue.losses;

  // 変化がない場合は無駄に保存しない
  if (!isSameRank) {
    await prisma.rankSnapshot.create({
      data: {
        queue: soloQueue.queueType,
        tier: soloQueue.tier,
        rank: soloQueue.rank,
        lp: soloQueue.leaguePoints,
        wins: soloQueue.wins,
        losses: soloQueue.losses,
      },
    });
  }

  // 同期後はトップページへ戻る
  return Response.redirect(new URL("/", request.url));
}
