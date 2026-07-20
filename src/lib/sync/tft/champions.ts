import { prisma } from "@/lib/prisma";
import {
  fetchLatestDDragonVersionTft,
  getCDragonChampionImageUrl,
  getDDragonChampionImageUrl,
} from "@/lib/ddragon";

type DDragonTftChampion = {
  id: string;
  name: string;
  tier?: number;
  image: {
    full: string;
  };
};

type DDragonResponse = {
  data: Record<string, DDragonTftChampion>;
};

/**
 * チャンピオンIDが通常TFTセットのユニットかどうかを判定する
 *
 * TFTTutorial_ などチュートリアル専用ユニットはマスタ不要なため除外する。
 * セット番号は1桁以上の数字であれば将来のセットも自動対応する。
 */
function isStandardTftChampionId(championId: string): boolean {
  return /^TFT\d+_/.test(championId);
}

/**
 * TFTチャンピオン情報を同期してDB保存する
 *
 * 通常のTFTセット用ユニットのみ同期し、チュートリアルなどの特殊ユニットを除外する。
 * 特殊ユニット（TFTTutorial_ など）はゲーム本編の試合に出現せず表示用途がないため。
 */
export async function syncTftChampions(): Promise<{
  ok: boolean;
  count: number;
}> {
  const version = await fetchLatestDDragonVersionTft();

  const res = await fetch(
    `https://ddragon.leagueoflegends.com/cdn/${version}/data/ja_JP/tft-champion.json`,
    {
      // 毎回最新を取りたいのでキャッシュしない
      cache: "no-store",
    }
  );

  if (!res.ok) {
    throw new Error("TFTチャンピオン一覧の取得に失敗しました");
  }

  const json = (await res.json()) as DDragonResponse;
  // チュートリアル専用ユニットなど特殊IDを除外し、通常セットのユニットのみ同期する
  const champions = Object.values(json.data).filter((champion) =>
    isStandardTftChampionId(champion.id)
  );

  await Promise.all(
    champions.map((champion) => {
      const cdragonImageUrl = getCDragonChampionImageUrl(champion.id);
      const ddragonImageUrl = getDDragonChampionImageUrl(version, champion.image.full);

      if (cdragonImageUrl === undefined) {
        // Step 2のフィルタで通常は到達しない。
        // imageUrl は NOT NULL 制約のため新規作成不可。
        // 既存レコードがあれば name/cost/ddragonImageUrl のみ更新する。
        console.warn(`[TFTチャンピオン同期] CDragon URL生成失敗のためスキップ: ${champion.id}`);
        return prisma.tftChampion.updateMany({
          where: { id: champion.id },
          data: { name: champion.name, cost: champion.tier ?? null, ddragonImageUrl },
        });
      }

      // ガードにより cdragonImageUrl は string に絞り込まれているため、直接 imageUrl へ設定する
      const updateData = {
        name: champion.name,
        cost: champion.tier ?? null,
        imageUrl: cdragonImageUrl,
        ddragonImageUrl,
      };

      return prisma.tftChampion.upsert({
        where: {
          id: champion.id,
        },
        update: updateData,
        create: {
          id: champion.id,
          name: champion.name,
          cost: champion.tier ?? null,
          imageUrl: cdragonImageUrl,
          ddragonImageUrl,
        },
      });
    })
  );

  return {
    ok: true,
    count: champions.length,
  };
}
