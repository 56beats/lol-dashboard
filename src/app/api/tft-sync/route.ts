import { updateLastTftMatchSync } from "@/lib/sync/appConfig";
import { syncTftMatches } from "@/lib/sync/tft/sync";

/**
 * TFT 試合同期 API の入口
 */
export async function GET(request: Request) {
  await syncTftMatches();
  await updateLastTftMatchSync();
  return Response.redirect(new URL("/", request.url));
}
