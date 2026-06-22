import { NextRequest } from "next/server";

/**
 * Vercel Cronから呼ばれる自動同期API
 *
 * 手動用の /api/sync と /api/sync-rank を順番に呼ぶ。
 * 直接DB処理を書かず既存APIを使うことで、同期ロジックの重複を避ける。
 */
export async function GET(request: NextRequest) {
  const baseUrl = request.nextUrl.origin;

  await fetch(`${baseUrl}/api/sync`, {
    cache: "no-store",
  });

  await fetch(`${baseUrl}/api/sync-rank`, {
    cache: "no-store",
  });

  return Response.json({
    ok: true,
  });
}
