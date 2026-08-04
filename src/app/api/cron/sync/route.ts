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

  let lolMatches: { ok: boolean; fetched?: number; saved?: number } = {
    ok: false,
  };
  let lolRank: { ok: boolean; changed?: boolean } = { ok: false };
  let tftMatches: { ok: boolean; saved?: number } = { ok: false };
  let tftRank: { ok: boolean; changed?: boolean } = { ok: false };

  try {
    const result = await syncLolMatches();
    lolMatches = { ok: true, ...result };
  } catch (error) {
    console.error(
      "[Cron] LoL試合同期エラー:",
      error instanceof Error ? error.message : "Unknown"
    );
  }

  try {
    const result = await syncLolRank();
    await updateLastRankSync();
    lolRank = { ok: true, ...result };
  } catch (error) {
    console.error(
      "[Cron] LoLランク同期エラー:",
      error instanceof Error ? error.message : "Unknown"
    );
  }

  try {
    const result = await syncTftMatches();
    await updateLastTftMatchSync();
    tftMatches = { ok: true, ...result };
  } catch (error) {
    console.error(
      "[Cron] TFT試合同期エラー:",
      error instanceof Error ? error.message : "Unknown"
    );
  }

  try {
    const result = await syncTftRank();
    await updateLastTftRankSync();
    tftRank = { ok: true, ...result };
  } catch (error) {
    console.error(
      "[Cron] TFTランク同期エラー:",
      error instanceof Error ? error.message : "Unknown"
    );
  }

  const finishedAt = new Date().toISOString();

  const results = { lolMatches, lolRank, tftMatches, tftRank };
  const ok = Object.values(results).every((result) => result.ok);

  return Response.json({
    ok,
    results,
    startedAt,
    finishedAt,
  });
}
