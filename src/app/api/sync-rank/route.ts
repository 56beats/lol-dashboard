import { updateLastRankSync } from "@/lib/sync/appConfig";
import { syncLolRank } from "@/lib/sync/lol/rank";

/**
 * LoL ランク同期 API の入口
 */
export async function GET(request: Request) {
  await syncLolRank();
  await updateLastRankSync();
  return Response.redirect(new URL("/", request.url));
}
