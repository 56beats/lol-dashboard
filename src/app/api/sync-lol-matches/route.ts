import { NextResponse } from "next/server";
import { syncLolMatches } from "@/lib/sync/lol/sync";

/**
 * LoL試合情報の同期API
 *
 * - POST: 同期を実行し、結果をJSONで返す
 * - GET: 同期を実行し、トップページへリダイレクト
 */
export async function POST() {
  try {
    const result = await syncLolMatches();

    return NextResponse.json({
      ok: true,
      fetched: result.fetched,
      saved: result.saved,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        ok: false,
        message: "LoL試合詳細の同期に失敗しました",
      },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  await POST();

  return Response.redirect(new URL("/", request.url));
}
