import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

type RiotTftMatchDetail = {
  metadata: {
    match_id: string;
  };
  info: {
    participants: RiotTftParticipant[];
  };
};

type RiotTftParticipant = {
  puuid: string;
  placement: number;
  level: number;
  last_round?: number;
  gold_left?: number;
  players_eliminated?: number;
  total_damage_to_players?: number;
  augments?: string[];
  traits?: unknown[];
  units?: unknown[];
  companion?: unknown;
};

/**
 * TFT試合詳細から全参加者分のデータを保存する
 *
 * 既存のTftMatchは自分用表示として残しつつ、
 * こちらは後から統計分析するための保存用として使う。
 */
export async function saveTftMatchParticipants(match: RiotTftMatchDetail) {
  const matchId = match.metadata.match_id;

  await Promise.all(
    match.info.participants.map((participant) =>
      prisma.tftMatchParticipant.upsert({
        where: {
          matchId_puuid: {
            matchId,
            puuid: participant.puuid,
          },
        },
        update: {
          placement: participant.placement,
          level: participant.level,
          lastRound: participant.last_round ?? null,
          goldLeft: participant.gold_left ?? null,
          playersEliminated: participant.players_eliminated ?? null,
          totalDamageToPlayers: participant.total_damage_to_players ?? null,

          // まずはRiot APIの形を保ったままJSON保存する
          augments: (participant.augments ?? []) as Prisma.InputJsonValue,
          traits: (participant.traits ?? []) as Prisma.InputJsonValue,
          units: (participant.units ?? []) as Prisma.InputJsonValue,
          companion: (participant.companion ?? null) as Prisma.InputJsonValue,
        },
        create: {
          matchId,
          puuid: participant.puuid,
          placement: participant.placement,
          level: participant.level,
          lastRound: participant.last_round ?? null,
          goldLeft: participant.gold_left ?? null,
          playersEliminated: participant.players_eliminated ?? null,
          totalDamageToPlayers: participant.total_damage_to_players ?? null,
          augments: (participant.augments ?? []) as Prisma.InputJsonValue,
          traits: (participant.traits ?? []) as Prisma.InputJsonValue,
          units: (participant.units ?? []) as Prisma.InputJsonValue,
          companion: (participant.companion ?? null) as Prisma.InputJsonValue,
        },
      })
    )
  );
}
