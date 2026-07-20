import { NextResponse } from "next/server";
import { syncTftChampions } from "@/lib/sync/tft/champions";
import { RiotApiError, riotErrorToHttpStatus } from "@/lib/riot/shared";

/**
 * TFT チャンピオン同期 API の入口
 */
export async function POST() {
  try {
    const result = await syncTftChampions();
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof RiotApiError) {
      console.error("[TFTチャンピオン同期] Riot API エラー:", error.status);
    } else if (error instanceof TypeError) {
      console.error("[TFTチャンピオン同期] 通信エラー:", error.message);
    } else {
      console.error("[TFTチャンピオン同期] 内部エラー:", error instanceof Error ? error.message : "Unknown");
    }
    const status = riotErrorToHttpStatus(error);
    return NextResponse.json(
      {
        ok: false,
        message: "TFTチャンピオン同期に失敗しました",
      },
      { status }
    );
  }
}
