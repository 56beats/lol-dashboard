import { NextResponse } from "next/server";
import { syncLolChampions } from "@/lib/sync/lol/champions";

/**
 * LoL チャンピオン同期 API の入口
 */
export async function POST() {
  try {
    const result = await syncLolChampions();
    return NextResponse.json(result);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        ok: false,
        message: "LoLチャンピオン同期に失敗しました",
      },
      { status: 500 }
    );
  }
}
