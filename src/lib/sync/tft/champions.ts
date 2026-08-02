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
 * 繝√Ε繝ｳ繝斐が繝ｳID縺碁壼ｸｸTFT繧ｻ繝・ヨ縺ｮ繝ｦ繝九ャ繝医°縺ｩ縺・°繧貞愛螳壹☆繧・
 *
 * TFTTutorial_ 縺ｪ縺ｩ繝√Η繝ｼ繝医Μ繧｢繝ｫ蟆ら畑繝ｦ繝九ャ繝医・繝槭せ繧ｿ荳崎ｦ√↑縺溘ａ髯､螟悶☆繧九・
 * 繧ｻ繝・ヨ逡ｪ蜿ｷ縺ｯ1譯∽ｻ･荳翫・謨ｰ蟄励〒縺ゅｌ縺ｰ蟆・擂縺ｮ繧ｻ繝・ヨ繧り・蜍募ｯｾ蠢懊☆繧九・
 */
function isStandardTftChampionId(championId: string): boolean {
  return /^TFT\d+_/.test(championId);
}

/**
 * TFT繝√Ε繝ｳ繝斐が繝ｳ諠・ｱ繧貞酔譛溘＠縺ｦDB菫晏ｭ倥☆繧・
 *
 * 騾壼ｸｸ縺ｮTFT繧ｻ繝・ヨ逕ｨ繝ｦ繝九ャ繝医・縺ｿ蜷梧悄縺励√メ繝･繝ｼ繝医Μ繧｢繝ｫ縺ｪ縺ｩ縺ｮ迚ｹ谿翫Θ繝九ャ繝医ｒ髯､螟悶☆繧九・
 * 迚ｹ谿翫Θ繝九ャ繝茨ｼ・FTTutorial_ 縺ｪ縺ｩ・峨・繧ｲ繝ｼ繝譛ｬ邱ｨ縺ｮ隧ｦ蜷医↓蜃ｺ迴ｾ縺帙★陦ｨ遉ｺ逕ｨ騾斐′縺ｪ縺・◆繧√・
 */
export async function syncTftChampions(): Promise<{
  ok: boolean;
  count: number;
}> {
  const version = await fetchLatestDDragonVersionTft();

  const res = await fetch(
    `https://ddragon.leagueoflegends.com/cdn/${version}/data/ja_JP/tft-champion.json`,
    {
      // 豈主屓譛譁ｰ繧貞叙繧翫◆縺・・縺ｧ繧ｭ繝｣繝・す繝･縺励↑縺・
      cache: "no-store",
    }
  );

  if (!res.ok) {
    throw new Error("TFT繝√Ε繝ｳ繝斐が繝ｳ荳隕ｧ縺ｮ蜿門ｾ励↓螟ｱ謨励＠縺ｾ縺励◆");
  }

  const json = (await res.json()) as DDragonResponse;
  // 繝√Η繝ｼ繝医Μ繧｢繝ｫ蟆ら畑繝ｦ繝九ャ繝医↑縺ｩ迚ｹ谿蟹D繧帝勁螟悶＠縲・壼ｸｸ繧ｻ繝・ヨ縺ｮ繝ｦ繝九ャ繝医・縺ｿ蜷梧悄縺吶ｋ
  const champions = Object.values(json.data).filter((champion) =>
    isStandardTftChampionId(champion.id)
  );

  await Promise.all(
    champions.map((champion) => {
      const cdragonImageUrl = getCDragonChampionImageUrl(champion.id);
      const ddragonImageUrl = getDDragonChampionImageUrl(version, champion.image.full);

      if (cdragonImageUrl === undefined) {
        // Step 2縺ｮ繝輔ぅ繝ｫ繧ｿ縺ｧ騾壼ｸｸ縺ｯ蛻ｰ驕斐＠縺ｪ縺・・
        // imageUrl 縺ｯ NOT NULL 蛻ｶ邏・・縺溘ａ譁ｰ隕丈ｽ懈・荳榊庄縲・
        // 譌｢蟄倥Ξ繧ｳ繝ｼ繝峨′縺ゅｌ縺ｰ name/cost/ddragonImageUrl 縺ｮ縺ｿ譖ｴ譁ｰ縺吶ｋ縲・
        console.warn(`[TFT繝√Ε繝ｳ繝斐が繝ｳ蜷梧悄] CDragon URL逕滓・螟ｱ謨励・縺溘ａ繧ｹ繧ｭ繝・・: ${champion.id}`);
        return prisma.tftChampion.updateMany({
          where: { id: champion.id },
          data: { name: champion.name, cost: champion.tier ?? null, ddragonImageUrl },
        });
      }

      // 繧ｬ繝ｼ繝峨↓繧医ｊ cdragonImageUrl 縺ｯ string 縺ｫ邨槭ｊ霎ｼ縺ｾ繧後※縺・ｋ縺溘ａ縲∫峩謗･ imageUrl 縺ｸ險ｭ螳壹☆繧・
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

