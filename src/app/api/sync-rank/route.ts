import { updateLastRankSync } from "@/lib/sync/appConfig";
import { syncLolRank } from "@/lib/sync/lol/rank";

/**
 * LoL ランク同期 API の入口
 */
export async function GET(request: Request) {
  const accountId =
    new URL(request.url).searchParams.get("account") ??
    new URL(request.url).searchParams.get("accountId") ??
    undefined;
  await syncLolRank(accountId);
  await updateLastRankSync(accountId);
  return Response.redirect(new URL("/", request.url));
}
