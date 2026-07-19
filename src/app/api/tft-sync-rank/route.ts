import { updateLastTftRankSync } from "@/lib/sync/appConfig";
import { syncTftRank } from "@/lib/sync/tft/rank";

/**
 * TFT ランク同期 API の入口
 */
export async function GET(request: Request) {
  await syncTftRank();
  await updateLastTftRankSync();
  return Response.redirect(new URL("/", request.url));
}
