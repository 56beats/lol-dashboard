import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  fetchLatestDDragonVersion,
  getLolChampionImageUrl,
  resolvePatch,
} from "@/lib/lol/championAssets";

type DDragonChampion = {
  id: string;
  key: string;
  name: string;
};

type DDragonChampionResponse = {
  data: Record<string, DDragonChampion>;
};

export async function POST() {
  try {
    const version = await fetchLatestDDragonVersion();
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

    return NextResponse.json({
      ok: true,
      count: champions.length,
      patch,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        ok: false,
        message: "LoLチャンピオン同期に失敗しました",
      },
      { status: 500 }
    );
  }
}
