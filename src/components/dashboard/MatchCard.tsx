"use client";

import { useState } from "react";
import { MatchCardHeader } from "@/components/dashboard/MatchCardHeader";
import { MatchDetailTable } from "@/components/dashboard/MatchDetailTable";

type MatchParticipant = {
  puuid: string;
  isMe: boolean;
  riotIdGameName: string | null;
  riotIdTagline: string | null;
  teamId: number;
  championName: string;
  championJa: string;
  championImageUrl?: string;
  kills: number;
  deaths: number;
  assists: number;
  totalMinionsKilled: number | null;
  neutralMinionsKilled: number | null;
  totalDamageDealtToChampions: number | null;
  visionScore: number | null;
  summoner1Id: number | null;
  summoner2Id: number | null;
  itemIds: number[];
};

type Props = {
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
  participants?: MatchParticipant[];
};

/**
 * LoLマッチカード
 *
 * ヘッダーはマッチ概要を表示し、
 * クリックで詳細テーブルを展開する。
 */
export function MatchCard({
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
  participants,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <MatchCardHeader
        champion={champion}
        championJa={championJa}
        win={win}
        kills={kills}
        deaths={deaths}
        assists={assists}
        gameMode={gameMode}
        queueId={queueId}
        playedAt={playedAt}
        ddragonVersion={ddragonVersion}
        itemIds={itemIds}
        isOpen={isOpen}
        onToggle={() => setIsOpen((current) => !current)}
      />

      {isOpen && participants && (
        <MatchDetailTable
          participants={participants}
          ddragonVersion={ddragonVersion}
        />
      )}
    </div>
  );
}
