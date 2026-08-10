import { prisma } from "@/lib/prisma";
import { syncLolMatches } from "@/lib/sync/lol/sync";
import { syncLolRank } from "@/lib/sync/lol/rank";
import { syncTftMatches } from "@/lib/sync/tft/sync";
import { syncTftRank } from "@/lib/sync/tft/rank";
import {
  updateLastRankSync,
  updateLastTftMatchSync,
  updateLastTftRankSync,
} from "@/lib/sync/appConfig";

/**
 * Vercel Cronから呼ばれる自動同期API
 *
 * CRON_SECRET Bearer認証を通過した場合のみ実行する。
 * 各タスクは独立したtry-catchで保護され、
 * 一部のタスクが失敗しても残りは継続される。
 */
export async function GET(request: Request) {
  const authHeader = request.headers.get("Authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return Response.json({ ok: false }, { status: 401 });
  }

  const startedAt = new Date().toISOString();

  const accounts = await prisma.riotAccount.findMany({
    orderBy: {
      createdAt: "asc",
    },
  });
  const targetAccountIds =
    accounts.length > 0 ? accounts.map((account) => account.id) : [undefined];

  const results: Array<{
    accountId: string | null;
    lolMatches: { ok: boolean; fetched?: number; saved?: number };
    lolRank: { ok: boolean; changed?: boolean };
    tftMatches: { ok: boolean; saved?: number };
    tftRank: { ok: boolean; changed?: boolean };
  }> = [];

  for (const accountId of targetAccountIds) {
    let lolMatches: { ok: boolean; fetched?: number; saved?: number } = {
      ok: false,
    };
    let lolRank: { ok: boolean; changed?: boolean } = { ok: false };
    let tftMatches: { ok: boolean; saved?: number } = { ok: false };
    let tftRank: { ok: boolean; changed?: boolean } = { ok: false };

    try {
      const result = await syncLolMatches(accountId);
      lolMatches = { ok: true, ...result };
    } catch (error) {
      console.error(
        "[Cron] LoL試合同期エラー:",
        error instanceof Error ? error.message : "Unknown"
      );
    }

    try {
      const result = await syncLolRank(accountId);
      await updateLastRankSync(accountId);
      lolRank = { ok: true, ...result };
    } catch (error) {
      console.error(
        "[Cron] LoLランク同期エラー:",
        error instanceof Error ? error.message : "Unknown"
      );
    }

    try {
      const result = await syncTftMatches(accountId);
      await updateLastTftMatchSync(accountId);
      tftMatches = { ok: true, ...result };
    } catch (error) {
      console.error(
        "[Cron] TFT試合同期エラー:",
        error instanceof Error ? error.message : "Unknown"
      );
    }

    try {
      const result = await syncTftRank(accountId);
      await updateLastTftRankSync(accountId);
      tftRank = { ok: true, ...result };
    } catch (error) {
      console.error(
        "[Cron] TFTランク同期エラー:",
        error instanceof Error ? error.message : "Unknown"
      );
    }

    results.push({
      accountId: accountId ?? null,
      lolMatches,
      lolRank,
      tftMatches,
      tftRank,
    });
  }

  const finishedAt = new Date().toISOString();

  const ok = results.every(
    (result) =>
      result.lolMatches.ok &&
      result.lolRank.ok &&
      result.tftMatches.ok &&
      result.tftRank.ok
  );

  return Response.json({
    ok,
    results,
    startedAt,
    finishedAt,
  });
}
