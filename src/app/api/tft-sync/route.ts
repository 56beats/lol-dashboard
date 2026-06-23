import { prisma } from "@/lib/prisma";
import { getAccount } from "@/lib/riot";
import { getTftMatch, getTftMatchIds } from "@/lib/tft/match";

/**
 * TFTの最新試合を取得してDBへ保存するAPI
 *
 * すでに保存済みのmatchIdはスキップする。
 * これにより、プレイしていない期間に無駄なデータが増えない。
 */
export async function GET(request: Request) {
  const account = await getAccount();

  const matchIds = await getTftMatchIds(account.puuid, 20);

  let saved = 0;

  for (const matchId of matchIds) {
    const exists = await prisma.tftMatch.findUnique({
      where: {
        id: matchId,
      },
    });

    // 保存済みなら何もしない
    if (exists) {
      continue;
    }

    const match = await getTftMatch(matchId);

    /**
     * TFTのparticipantsには各プレイヤーの情報が入っている。
     * その中から自分のPUUIDと一致するデータだけ取り出す。
     */
    const me = match.info.participants.find(
      (participant: any) => participant.puuid === account.puuid
    );

    if (!me) {
      continue;
    }

    /**
     * オーグメントは文字列配列で返る。
     * 例: ["TFT13_Augment_xxx", ...]
     */
    const augments = me.augments ?? [];

    /**
     * traitsは構成の特性情報。
     * tier_current が 1以上のものだけ保存する。
     */
    const traits =
      me.traits
        ?.filter((trait: any) => trait.tier_current > 0)
        .map((trait: any) => trait.name) ?? [];

    /**
     * unitsは盤面に出していたユニット情報。
     * まずは character_id だけ保存する。
     */
    const units = me.units?.map((unit: any) => unit.character_id) ?? [];

    await prisma.tftMatch.create({
      data: {
        id: matchId,
        placement: me.placement,
        level: me.level,

        // オーグメントIDを保存。表示時にData Dragonで日本語名・画像へ変換する
        augments: me.augments ?? [],

        // 特性は「何体で発動しているか」「何段階目か」が重要なので詳細保存
        traits:
          me.traits
            ?.filter((trait: any) => trait.tier_current > 0)
            .map((trait: any) => ({
              id: trait.name,
              numUnits: trait.num_units,
              tierCurrent: trait.tier_current,
              style: trait.style,
            })) ?? [],

        // ユニットは★レベルと装備が重要なので詳細保存
        units:
          me.units?.map((unit: any) => ({
            id: unit.character_id,
            tier: unit.tier,
            itemIds: unit.itemNames ?? [],
          })) ?? [],

        playedAt: new Date(match.info.game_datetime),
      },
    });

    saved++;
  }

  return Response.redirect(new URL("/", request.url));
}
