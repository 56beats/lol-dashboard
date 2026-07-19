"use client";

import Image from "next/image";
import { getLoLItemImageUrl } from "@/lib/ddragon/shared";
import { filterItemIds, formatNumber } from "@/lib/match";

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

type MatchDetailTableProps = {
  participants: MatchParticipant[];
  ddragonVersion: string;
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

function getSummonerSpellImageUrl(
  spellId: number,
  ddragonVersion: string
): string | null {
  const fileName = SUMMONER_SPELL_IMAGE_MAP[spellId];

  if (!fileName) {
    return null;
  }

  return `https://ddragon.leagueoflegends.com/cdn/${ddragonVersion}/img/spell/${fileName}`;
}

/**
 * LoLマッチカードの詳細テーブル部分
 * 全参加者をチーム別に表示し、各プレイヤーの詳細情報を表示
 */
export function MatchDetailTable({
  participants,
  ddragonVersion,
}: MatchDetailTableProps) {
  const maxDamage =
    participants && participants.length > 0
      ? Math.max(
          ...participants.map(
            (participant) => participant.totalDamageDealtToChampions ?? 0
          )
        )
      : 0;

  return (
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
                  maxDamage > 0 ? Math.round((damage / maxDamage) * 100) : 0;

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
                              src={getLoLItemImageUrl(itemId, ddragonVersion)}
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
                            participant.isMe ? "bg-sky-400" : "bg-slate-500",
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
  );
}
