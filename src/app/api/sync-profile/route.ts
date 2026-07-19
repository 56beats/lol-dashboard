import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAccount } from "@/lib/riot";

/**
 * Riot IDからプロフィール情報を取得してDBへ保存するAPI
 *
 * 画面表示ではRiot APIを直接叩かず、
 * ここで保存したAppConfigを見るようにする。
 */
export async function POST() {
  try {
    const account = await getAccount();

    await prisma.appConfig.upsert({
      where: {
        id: "default",
      },
      update: {
        riotGameName: account.gameName,
        riotTagLine: account.tagLine,
        puuid: account.puuid,
        lastProfileSync: new Date(),
      },
      create: {
        id: "default",
        riotGameName: account.gameName,
        riotTagLine: account.tagLine,
        puuid: account.puuid,
        lastProfileSync: new Date(),
      },
    });

    return NextResponse.json({
      ok: true,
      gameName: account.gameName,
      tagLine: account.tagLine,
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

/**
 * 手動実行しやすいようにGETでも同期できるようにする。
 */
export async function GET(request: Request) {
  await POST();

  return Response.redirect(new URL("/", request.url));
}
