import { updateLastTftMatchSync } from "@/lib/sync/appConfig";
import { syncTftMatches } from "@/lib/sync/tft/sync";
import { RiotApiError, riotErrorToHttpStatus } from "@/lib/riot/shared";

/**
 * TFT 試合同期 API の入口
 *
 * 成功時は "/" へリダイレクト。
 * エラー時は Riot API ステータスに応じたHTTPステータスで JSON を返す。
 */
export async function GET(request: Request) {
  try {
    await syncTftMatches();
    await updateLastTftMatchSync();
    return Response.redirect(new URL("/", request.url));
  } catch (error) {
    if (error instanceof RiotApiError) {
      console.error("[TFT試合同期] Riot API エラー:", error.status);
    } else if (error instanceof TypeError) {
      console.error("[TFT試合同期] 通信エラー:", error.message);
    } else {
      console.error("[TFT試合同期] 内部エラー:", error instanceof Error ? error.message : "Unknown");
    }
    const status = riotErrorToHttpStatus(error);
    return Response.json({ success: false, error: "TFT試合の同期に失敗しました" }, { status });
  }
}
