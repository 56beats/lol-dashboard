import { NextResponse } from "next/server";
import { syncTftChampions } from "@/lib/sync/tft/champions";

/**
 * TFT チャンピオン同期 API の入口
 */
export async function POST() {
  try {
    const result = await syncTftChampions();
    return NextResponse.json(result);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        ok: false,
        message: "TFTチャンピオン同期に失敗しました",
      },
      { status: 500 }
    );
  }
}
