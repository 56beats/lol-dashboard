import { NextResponse } from "next/server";
import { syncProfile } from "@/lib/sync/profile";

/**
 * プロフィール同期 API の入口
 *
 * - POST: 同期を実行し、結果をJSONで返す
 * - GET: 同期を実行し、トップページへリダイレクト
 */
export async function POST(request?: Request) {
  try {
    const url = request ? new URL(request.url) : null;
    const accountId =
      url?.searchParams.get("account") ??
      url?.searchParams.get("accountId") ??
      undefined;
    const createNew = url?.searchParams.get("createNew") === "1";
    const gameName = url?.searchParams.get("gameName") ?? undefined;
    const tagLine = url?.searchParams.get("tagLine") ?? undefined;
    const result = await syncProfile({
      accountId,
      gameName,
      tagLine,
      createNew,
    });

    return NextResponse.json({
      ok: true,
      gameName: result.gameName,
      tagLine: result.tagLine,
      accountId: result.accountId,
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
  await POST(request);

  return Response.redirect(new URL("/", request.url));
}
