"use client";

import Image from "next/image";
import { useState } from "react";
import { getChampionImageUrl, getItemImageUrl } from "@/lib/ddragon";
import { calcKda, filterItemIds, formatQueueType } from "@/lib/match";

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

const SUMMONER_SPELL_IMAGE_MAP: Record<number, string> = {
  1: "SummonerBoost.png", // クレンズ
  3: "SummonerExhaust.png",
  4: "SummonerFlash.png",
  6: "SummonerHaste.png", // ゴースト
  7: "SummonerHeal.png",
  11: "SummonerSmite.png",
  12: "SummonerTeleport.png",
  14: "SummonerDot.png", // イグナイト
  21: "SummonerBarrier.png",
  32: "SummonerSnowball.png",
};

function getSummonerSpellImageUrl(spellId: number, ddragonVersion: string) {
  const fileName = SUMMONER_SPELL_IMAGE_MAP[spellId];

  if (!fileName) {
    return null;
  }

  return `https://ddragon.leagueoflegends.com/cdn/${ddragonVersion}/img/spell/${fileName}`;
}

function formatNumber(value: number | null) {
  if (value === null) return "-";
  if (value >= 1000) return `${(value / 1000).toFixed(1)}k`;
  return String(value);
}

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

  const kda = calcKda(kills, deaths, assists);
  const displayItems = filterItemIds(itemIds);
  const queueLabel = formatQueueType(queueId, gameMode);

  const maxDamage =
    participants && participants.length > 0
      ? Math.max(
          ...participants.map(
            (participant) => participant.totalDamageDealtToChampions ?? 0
          )
        )
      : 0;

  return (
    <div
      onClick={() => setIsOpen((current) => !current)}
      className={[
        "cursor-pointer rounded-2xl border bg-white/5 p-4 shadow-lg backdrop-blur transition hover:bg-white/10",
        win ? "border-blue-400/30" : "border-rose-400/30",
      ].join(" ")}
    >
      <div className="flex items-center gap-4">
        <div className="w-16 text-sm font-bold">
          <div className={win ? "text-sky-400" : "text-rose-400"}>
            {win ? "勝利" : "敗北"}
          </div>

          <div className="mt-1 text-xs text-slate-500">
            {playedAt.toLocaleDateString("ja-JP")}
          </div>
        </div>

        <Image
          src={getChampionImageUrl(champion, ddragonVersion)}
          alt={championJa ?? champion}
          width={56}
          height={56}
          className="rounded-full border border-white/20"
        />

        <div className="min-w-32 flex-1">
          <div className="font-bold text-white">{championJa ?? champion}</div>
          <div className="text-xs text-slate-400">{queueLabel}</div>

          <div className="mt-2 flex gap-1">
            {displayItems.map((itemId, index) => (
              <Image
                key={`${itemId}-${index}`}
                src={getItemImageUrl(itemId, ddragonVersion)}
                alt={`item-${itemId}`}
                width={28}
                height={28}
                className="rounded-md border border-white/10"
              />
            ))}
          </div>
        </div>

        <div className="text-right">
          <div className="text-lg font-bold text-white">
            {kills} / <span className="text-rose-300">{deaths}</span> /{" "}
            {assists}
          </div>

          <div
            className={win ? "text-sm text-sky-400" : "text-sm text-rose-400"}
          >
            {kda} KDA
          </div>

          <div className="mt-1 text-xs text-slate-500">
            {isOpen ? "閉じる" : "詳細"}
          </div>
        </div>
      </div>

      {isOpen && participants && (
        <div className="mt-5 border-t border-white/10 pt-5">
          <div className="grid gap-4 md:grid-cols-2">
            {[100, 200].map((teamId) => (
              <div key={teamId} className="space-y-2">
                <div className="text-xs font-bold text-slate-400">
                  {teamId === 100 ? "Blue Team" : "Red Team"}
                </div>

                {participants
                  .filter((participant) => participant.teamId === teamId)
                  .map((participant) => {
                    const cs =
                      (participant.totalMinionsKilled ?? 0) +
                      (participant.neutralMinionsKilled ?? 0);

                    const damage = participant.totalDamageDealtToChampions ?? 0;

                    const damagePercent =
                      maxDamage > 0
                        ? Math.round((damage / maxDamage) * 100)
                        : 0;

                    return (
                      <div
                        key={participant.puuid}
                        className={[
                          "rounded-xl border px-3 py-2",
                          participant.isMe
                            ? "border-sky-400/70 bg-sky-500/15"
                            : "border-white/5 bg-black/20",
                        ].join(" ")}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex min-w-0 items-center gap-2">
                            {participant.championImageUrl && (
                              <Image
                                src={participant.championImageUrl}
                                alt={participant.championJa}
                                width={36}
                                height={36}
                                className="rounded-full border border-white/10"
                              />
                            )}

                            <div className="min-w-0">
                              <div className="truncate text-sm font-bold text-white">
                                {participant.riotIdGameName ?? "Unknown"}
                                {participant.isMe && (
                                  <span className="ml-1 text-xs text-sky-300">
                                    You
                                  </span>
                                )}
                              </div>

                              <div className="text-xs text-slate-400">
                                {participant.championJa}
                              </div>
                            </div>
                          </div>

                          <div className="text-right text-xs text-slate-300">
                            <div className="font-bold">
                              {participant.kills} /{" "}
                              <span className="text-rose-300">
                                {participant.deaths}
                              </span>{" "}
                              / {participant.assists}
                            </div>

                            <div className="text-slate-500">
                              CS {cs} / 視界 {participant.visionScore ?? "-"}
                            </div>
                          </div>
                        </div>

                        <div className="mt-2 flex items-center justify-between gap-2">
                          <div className="flex gap-1">
                            {[participant.summoner1Id, participant.summoner2Id]
                              .filter((spellId): spellId is number => !!spellId)
                              .map((spellId) => {
                                const spellImageUrl = getSummonerSpellImageUrl(
                                  spellId,
                                  ddragonVersion
                                );

                                if (!spellImageUrl) {
                                  return null;
                                }

                                return (
                                  <Image
                                    key={spellId}
                                    src={spellImageUrl}
                                    alt={`spell-${spellId}`}
                                    width={22}
                                    height={22}
                                    className="rounded border border-white/10"
                                  />
                                );
                              })}
                          </div>

                          <div className="flex gap-1">
                            {filterItemIds(participant.itemIds).map(
                              (itemId, index) => (
                                <Image
                                  key={`${participant.puuid}-${itemId}-${index}`}
                                  src={getItemImageUrl(itemId, ddragonVersion)}
                                  alt={`item-${itemId}`}
                                  width={22}
                                  height={22}
                                  className="rounded border border-white/10"
                                />
                              )
                            )}
                          </div>
                        </div>

                        <div className="mt-2">
                          <div className="flex items-center justify-between text-[11px] text-slate-500">
                            <span>DMG</span>
                            <span>{formatNumber(damage)}</span>
                          </div>

                          <div className="mt-1 h-1.5 rounded-full bg-white/10">
                            <div
                              className={[
                                "h-1.5 rounded-full",
                                participant.isMe
                                  ? "bg-sky-400"
                                  : "bg-slate-500",
                              ].join(" ")}
                              style={{ width: `${damagePercent}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
