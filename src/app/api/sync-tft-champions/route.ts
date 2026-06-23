import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  fetchLatestDDragonVersion,
  getCDragonChampionImageUrl,
  getDDragonChampionImageUrl,
} from "@/lib/tftChampionAssets";

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

export async function POST() {
  try {
    const version = await fetchLatestDDragonVersion();

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
    // Set17のチャンピオンだけ登録する
    const champions = Object.values(json.data).filter((champion) =>
      champion.id.startsWith("TFT17_")
    );

    await Promise.all(
      champions.map((champion) =>
        prisma.tftChampion.upsert({
          where: {
            id: champion.id,
          },
          update: {
            name: champion.name,
            cost: champion.tier ?? null,
            imageUrl: getCDragonChampionImageUrl(champion.id),
            ddragonImageUrl: getDDragonChampionImageUrl(
              version,
              champion.image.full
            ),
          },
          create: {
            id: champion.id,
            name: champion.name,
            cost: champion.tier ?? null,
            imageUrl: getCDragonChampionImageUrl(champion.id),
            ddragonImageUrl: getDDragonChampionImageUrl(
              version,
              champion.image.full
            ),
          },
        })
      )
    );

    return NextResponse.json({
      ok: true,
      count: champions.length,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        ok: false,
        message: "TFTチャンピオン同期に失敗しました",
      },
      { status: 500 }
    );
  }
}
