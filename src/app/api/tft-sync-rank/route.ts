import { updateLastTftRankSync } from "@/lib/sync/appConfig";
import { syncTftRank } from "@/lib/sync/tft/rank";
import { RiotApiError, riotErrorToHttpStatus } from "@/lib/riot/shared";

/**
 * TFT ランク同期 API の入口
 *
 * 成功時は "/" へリダイレクト。
 * エラー時は Riot API ステータスに応じたHTTPステータスで JSON を返す。
 */
export async function GET(request: Request) {
  const accountId =
    new URL(request.url).searchParams.get("account") ??
    new URL(request.url).searchParams.get("accountId") ??
    undefined;

  try {
    await syncTftRank(accountId);
    await updateLastTftRankSync(accountId);
    return Response.redirect(new URL("/", request.url));
  } catch (error) {
    if (error instanceof RiotApiError) {
      console.error("[TFTランク同期] Riot API エラー:", error.status);
    } else if (error instanceof TypeError) {
      console.error("[TFTランク同期] 通信エラー:", error.message);
    } else {
      console.error(
        "[TFTランク同期] 内部エラー:",
        error instanceof Error ? error.message : "Unknown"
      );
    }
    const status = riotErrorToHttpStatus(error);
    return Response.json(
      { success: false, error: "TFTランクの同期に失敗しました" },
      { status }
    );
  }
}
