import { NextRequest } from "next/server";

/**
 * Vercel Cronから呼ばれる自動同期API
 *
 * Riot APIから最新データを取得してDBへ保存する。
 */
export async function GET(request: NextRequest) {
  const baseUrl = request.nextUrl.origin;

  const jobs = [
    `${baseUrl}/api/sync-lol-matches`,
    `${baseUrl}/api/sync-rank`,
    `${baseUrl}/api/tft-sync`,
    `${baseUrl}/api/tft-sync-rank`,
  ];

  const results = [];

  for (const url of jobs) {
    try {
      const res = await fetch(url, {
        method: url.includes("sync-lol-matches") ? "POST" : "GET",
        cache: "no-store",
      });

      results.push({
        url,
        status: res.status,
        ok: res.ok,
      });
    } catch (error) {
      results.push({
        url,
        ok: false,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  return Response.json({
    ok: true,
    results,
  });
}
