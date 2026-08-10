import { prisma } from "@/lib/prisma";
import { getConfiguredPuuid } from "@/lib/sync/appConfig";
import { getTftMatch, getTftMatchIds } from "@/lib/tft/match";
import { saveTftMatchParticipants } from "@/lib/tft/saveTftMatchDetail";
import type { RiotTftMatchDetail } from "@/types/tft";

/**
 * TFT隧ｦ蜷医ｒ蜷梧悄縺励※DB菫晏ｭ倥☆繧・
 *
 * 譌｢縺ｫ菫晏ｭ俶ｸ医∩縺ｮmatchId縺ｯ繧ｹ繧ｭ繝・・縲・
 * 繝励Ξ繧､縺励※縺・↑縺・悄髢薙↓辟｡鬧・↑繝・・繧ｿ縺悟｢励∴縺ｪ縺・・
 */
export async function syncTftMatches(
  accountId?: string | null
): Promise<{ saved: number }> {
  const puuid = await getConfiguredPuuid(accountId);
  const matchIds = await getTftMatchIds(puuid, 20);

  let saved = 0;

  for (const matchId of matchIds) {
    // 譌｢縺ｫ菫晏ｭ俶ｸ医∩縺九←縺・°遒ｺ隱・
    const exists = await prisma.tftMatch.findFirst({
      where: {
        matchId,
        riotAccountId: accountId ?? null,
      },
    });

    const match = (await getTftMatch(matchId)) as RiotTftMatchDetail;

    // TFT隧ｦ蜷医・蜈ｨ蜿ょ刈閠・ョ繝ｼ繧ｿ繧剃ｿ晏ｭ倥☆繧・
    // 譌｢蟄倥・TftMatch縺ｯ閾ｪ蛻・畑陦ｨ遉ｺ縲√％縺｡繧峨・莉雁ｾ後・邨ｱ險亥・譫千畑
    await saveTftMatchParticipants(match);

    // 閾ｪ蛻・畑縺ｮTftMatch縺御ｿ晏ｭ俶ｸ医∩縺ｪ繧峨√％縺薙〒繧ｹ繧ｭ繝・・縺吶ｋ
    // 縺溘□縺嶺ｸ翫〒蜿ょ刈閠・ョ繝ｼ繧ｿ縺ｯ菫晏ｭ俶ｸ医∩
    if (exists) {
      continue;
    }

    /**
     * TFT縺ｮparticipants縺ｫ縺ｯ蜷・・繝ｬ繧､繝､繝ｼ縺ｮ諠・ｱ縺悟・縺｣縺ｦ縺・ｋ縲・
     * 縺昴・荳ｭ縺九ｉ閾ｪ蛻・・PUUID縺ｨ荳閾ｴ縺吶ｋ繝・・繧ｿ縺縺大叙繧雁・縺吶・
     */
    const me = match.info.participants.find(
      (participant) => participant.puuid === puuid
    );

    if (!me) {
      continue;
    }

    await prisma.tftMatch.create({
      data: {
        id: `${accountId ?? "legacy"}-${matchId}`,
        matchId,
        riotAccountId: accountId ?? null,
        placement: me.placement,
        level: me.level,

        augments: me.augments ?? [],

        traits:
          me.traits
            ?.filter((trait) => trait.tier_current > 0)
            .map((trait) => ({
              id: trait.name,
              numUnits: trait.num_units,
              tierCurrent: trait.tier_current,
              style: trait.style,
            })) ?? [],

        units:
          me.units?.map((unit) => ({
            id: unit.character_id,
            tier: unit.tier,
            itemIds: unit.itemNames ?? [],
          })) ?? [],

        playedAt: new Date(match.info.game_datetime ?? 0),
      },
    });

    saved++;
  }

  return { saved };
}
