"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type GameType = "lol" | "tft";
type SyncType = "matches" | "rank";

type Props = {
  game: GameType;
  lastMatchSync?: Date | null;
  lastRankSync?: Date | null;
};

type SyncState = {
  type: SyncType | null;
  message: string | null;
  isError: boolean;
};

/**
 * 日時を日本時間で表示する
 */
function formatSyncDate(date?: Date | null): string {
  if (!date) {
    return "未同期";
  }

  return new Intl.DateTimeFormat("ja-JP", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

/**
 * HTTPステータスをユーザー向けメッセージへ変換する
 */
function getSyncErrorMessage(status: number): string {
  if (status === 401 || status === 403) {
    return "Riot APIキーを確認してください";
  }

  if (status === 429) {
    return "アクセスが集中しています。少し待ってから再実行してください";
  }

  if (status === 502 || status === 503) {
    return "Riot APIへ接続できませんでした";
  }

  return "同期に失敗しました";
}

/**
 * LoL・TFT共通の手動同期UI
 *
 * Server Componentであるpage.tsxは維持し、
 * 同期状態を必要とするこの部分だけClient Componentにする。
 */
export function SyncControls({ game, lastMatchSync, lastRankSync }: Props) {
  const router = useRouter();

  const [syncState, setSyncState] = useState<SyncState>({
    type: null,
    message: null,
    isError: false,
  });

  const isSyncing = syncState.type !== null;

  const isTft = game === "tft";

  const matchEndpoint = isTft ? "/api/tft-sync" : "/api/sync-lol-matches";

  const rankEndpoint = isTft ? "/api/tft-sync-rank" : "/api/sync-rank";

  const gameLabel = isTft ? "TFT" : "LoL";

  async function handleSync(type: SyncType) {
    const endpoint = type === "matches" ? matchEndpoint : rankEndpoint;
    const targetLabel = type === "matches" ? "試合" : "LP";

    setSyncState({
      type,
      message: `${gameLabel} ${targetLabel}データを同期しています`,
      isError: false,
    });

    try {
      const response = await fetch(endpoint, {
        method: "GET",
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(getSyncErrorMessage(response.status));
      }

      setSyncState({
        type: null,
        message: `${gameLabel} ${targetLabel}データを同期しました`,
        isError: false,
      });

      /*
       * DB更新後、Server Componentを再実行して
       * 最新の試合・ランク・同期日時を取得する。
       */
      router.refresh();
    } catch (error) {
      setSyncState({
        type: null,
        message:
          error instanceof Error
            ? error.message
            : `${targetLabel}データの同期に失敗しました`,
        isError: true,
      });
    }
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <div className="flex flex-wrap justify-end gap-2">
        <div>
          <button
            type="button"
            onClick={() => handleSync("matches")}
            disabled={isSyncing}
            className={[
              "bg-primary text-surface hover:bg-primary-hover rounded-xl px-4 py-2 text-sm font-bold transition",
              "disabled:cursor-not-allowed disabled:opacity-50",
            ].join(" ")}
          >
            {syncState.type === "matches"
              ? "同期中..."
              : `${gameLabel}試合同期`}
          </button>

          <div className="text-muted mt-1 text-right text-[11px]">
            最終：{formatSyncDate(lastMatchSync)}
          </div>
        </div>

        <div>
          <button
            type="button"
            onClick={() => handleSync("rank")}
            disabled={isSyncing}
            className="bg-primary text-surface hover:bg-primary-hover rounded-xl px-4 py-2 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-50"
          >
            {syncState.type === "rank" ? "同期中..." : `${gameLabel} LP同期`}
          </button>

          <div className="text-muted mt-1 text-right text-[11px]">
            最終：{formatSyncDate(lastRankSync)}
          </div>
        </div>
      </div>

      {syncState.message && (
        <p
          role={syncState.isError ? "alert" : "status"}
          aria-live="polite"
          className={[
            "text-xs",
            syncState.isError ? "text-danger" : "text-success",
          ].join(" ")}
        >
          {syncState.message}
        </p>
      )}
    </div>
  );
}
