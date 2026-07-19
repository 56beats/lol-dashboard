import { NextResponse } from "next/server";
import { syncProfile } from "@/lib/sync/profile";

/**
 * プロフィール同期 API の入口
 *
 * - POST: 同期を実行し、結果をJSONで返す
 * - GET: 同期を実行し、トップページへリダイレクト
 */
export async function POST() {
  try {
    const result = await syncProfile();

    return NextResponse.json({
      ok: true,
      gameName: result.gameName,
      tagLine: result.tagLine,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        ok: false,
        message: "プロフィール同期に失敗しました",
      },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  await POST();

  return Response.redirect(new URL("/", request.url));
}
