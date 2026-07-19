import { prisma } from "@/lib/prisma";
import {
  fetchLatestDDragonVersionLoL,
  getLolChampionImageUrl,
} from "@/lib/ddragon";
import { resolvePatch } from "@/lib/lol/match";

type DDragonChampion = {
  id: string;
  key: string;
  name: string;
};

type DDragonChampionResponse = {
  data: Record<string, DDragonChampion>;
};

/**
 * LoLチャンピオン情報を同期してDB保存する
 * 日本語・英語名とパッチ情報を保存
 */
export async function syncLolChampions(): Promise<{
  ok: boolean;
  count: number;
  patch: string;
}> {
  const version = await fetchLatestDDragonVersionLoL();
  const patch = resolvePatch(version);

  const jaRes = await fetch(
    `https://ddragon.leagueoflegends.com/cdn/${version}/data/ja_JP/champion.json`,
    { cache: "no-store" }
  );

  const enRes = await fetch(
    `https://ddragon.leagueoflegends.com/cdn/${version}/data/en_US/champion.json`,
    { cache: "no-store" }
  );

  if (!jaRes.ok || !enRes.ok) {
    throw new Error("LoLチャンピオン一覧の取得に失敗しました");
  }

  const jaJson = (await jaRes.json()) as DDragonChampionResponse;
  const enJson = (await enRes.json()) as DDragonChampionResponse;

  const champions = Object.values(jaJson.data);

  await Promise.all(
    champions.map((champion) => {
      const enChampion = enJson.data[champion.id];

      return prisma.lolChampion.upsert({
        where: {
          key: Number(champion.key),
        },
        update: {
          id: champion.id,
          nameJa: champion.name,
          nameEn: enChampion?.name ?? null,
          imageUrl: getLolChampionImageUrl(version, champion.id),
          patch,
        },
        create: {
          key: Number(champion.key),
          id: champion.id,
          nameJa: champion.name,
          nameEn: enChampion?.name ?? null,
          imageUrl: getLolChampionImageUrl(version, champion.id),
          patch,
        },
      });
    })
  );

  return {
    ok: true,
    count: champions.length,
    patch,
  };
}
