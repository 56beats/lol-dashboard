"use client";

import Image from "next/image";
import {
  getLoLChampionImageUrl,
  getLoLItemImageUrl,
} from "@/lib/ddragon/shared";
import { calcKda, filterItemIds, formatQueueType } from "@/lib/match";

type MatchCardHeaderProps = {
  champion: string;
  championJa?: string;
  win: boolean;
  kills: number;
  deaths: number;
  assists: number;
  gameMode: string;
  queueId?: number | null;
  playedAt: Date;
  ddragonVersion: string;
  itemIds: number[];
  isOpen: boolean;
  onToggle: () => void;
};

/**
 * LoLマッチカードのヘッダー部分
 * 勝敗、チャンピオン、KDA、アイテムを表示
 */
export function MatchCardHeader({
  champion,
  championJa,
  win,
  kills,
  deaths,
  assists,
  gameMode,
  queueId,
  playedAt,
  ddragonVersion,
  itemIds,
  isOpen,
  onToggle,
}: MatchCardHeaderProps) {
  const kda = calcKda(kills, deaths, assists);
  const displayItems = filterItemIds(itemIds);
  const queueLabel = formatQueueType(queueId, gameMode);

  return (
    <div
      onClick={onToggle}
      className={[
        "bg-surface hover:bg-surface-subtle cursor-pointer rounded-2xl border p-3 shadow-lg backdrop-blur transition sm:p-4",
        win ? "border-success" : "border-danger",
      ].join(" ")}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
        <div className="flex items-center gap-3 sm:w-16 sm:flex-col sm:items-start sm:gap-1">
          <div className={win ? "text-success" : "text-danger"}>
            {win ? "勝利" : "敗北"}
          </div>

          <div className="text-muted mt-1 text-xs">
            {playedAt.toLocaleDateString("ja-JP")}
          </div>
        </div>

        <Image
          src={getLoLChampionImageUrl(champion, ddragonVersion)}
          alt={championJa ?? champion}
          width={56}
          height={56}
          className="border-border h-14 w-14 rounded-full border sm:h-14 sm:w-14"
        />

        <div className="min-w-0 flex-1">
          <div className="text-foreground font-bold break-words">
            {championJa ?? champion}
          </div>
          <div className="text-muted text-xs">{queueLabel}</div>

          <div className="mt-2 flex flex-wrap gap-1">
            {displayItems.map((itemId, index) => (
              <Image
                key={`${itemId}-${index}`}
                src={getLoLItemImageUrl(itemId, ddragonVersion)}
                alt={`item-${itemId}`}
                width={28}
                height={28}
                className="border-border rounded-md border"
              />
            ))}
          </div>
        </div>

        <div className="text-left sm:text-right">
          <div className="text-foreground text-base font-bold sm:text-lg">
            {kills} / <span className="text-danger">{deaths}</span> / {assists}
          </div>

          <div className={win ? "text-success text-sm" : "text-danger text-sm"}>
            {kda} KDA
          </div>

          <div className="text-muted mt-1 text-xs">
            {isOpen ? "閉じる" : "詳細"}
          </div>
        </div>
      </div>
    </div>
  );
}
