import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { RiotTftMatchDetail } from "@/types/tft";

/**
 * TFT隧ｦ蜷郁ｩｳ邏ｰ縺九ｉ蜈ｨ蜿ょ刈閠・・縺ｮ繝・・繧ｿ繧剃ｿ晏ｭ倥☆繧・
 *
 * 譌｢蟄倥・TftMatch縺ｯ閾ｪ蛻・畑陦ｨ遉ｺ縺ｨ縺励※谿九＠縺､縺､縲・
 * 縺薙■繧峨・蠕後°繧臥ｵｱ險亥・譫舌☆繧九◆繧√・菫晏ｭ倡畑縺ｨ縺励※菴ｿ縺・・
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

          // 縺ｾ縺壹・Riot API縺ｮ蠖｢繧剃ｿ昴▲縺溘∪縺ｾJSON菫晏ｭ倥☆繧・
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

