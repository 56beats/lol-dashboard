const DDRAGON_BASE_URL = "https://ddragon.leagueoflegends.com";

type TftDisplayData = {
  id: string;
  name: string;
  imageUrl?: string;
};

/**
 * Data Dragonで使える最新バージョンを取得する
 *
 * TFTのユニット・特性・アイテム画像はData Dragonから取得する。
 * まず最新バージョンを取得して、そのバージョンのJSONを参照する。
 */
async function getLatestDdragonVersion() {
  const response = await fetch(`${DDRAGON_BASE_URL}/api/versions.json`, {
    cache: "force-cache",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch Data Dragon versions");
  }

  const versions: string[] = await response.json();

  return versions[0];
}

/**
 * TFT用Data Dragon JSONを取得する
 *
 * fileName例:
 * - tft-champion.json
 * - tft-trait.json
 * - tft-augments.json
 * - tft-item.json
 */
async function fetchTftJson(version: string, fileName: string) {
  const response = await fetch(
    `${DDRAGON_BASE_URL}/cdn/${version}/data/ja_JP/${fileName}`,
    {
      cache: "force-cache",
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch TFT Data Dragon: ${fileName}`);
  }

  return response.json();
}

/**
 * Data DragonのJSONを id => 表示情報 のMapへ変換する
 *
 * DBには "TFT17_Kindred" のようなIDだけ保存しているため、
 * 画面表示時にこのMapを使って日本語名と画像URLへ変換する。
 */
function toDisplayMap(version: string, json: any) {
  const map: Record<string, TftDisplayData> = {};

  for (const item of Object.values<any>(json.data)) {
    map[item.id] = {
      id: item.id,
      name: item.name,

      // fullはカードアート・スプラッシュ画像の場合がある
      imageUrl: item.image
        ? `${DDRAGON_BASE_URL}/cdn/${version}/img/${item.image.group}/${item.image.full}`
        : undefined,

      // 小さいアイコンはsprite画像から切り抜く
      sprite: item.image
        ? {
            url: `${DDRAGON_BASE_URL}/cdn/${version}/img/sprite/${item.image.sprite}`,
            x: item.image.x,
            y: item.image.y,
            w: item.image.w,
            h: item.image.h,
          }
        : undefined,
    };
  }

  return map;
}

/**
 * TFTの日本語名・画像情報をまとめて取得する
 *
 * 返却するMap:
 * - champions: ユニット
 * - traits: 特性
 * - augments: オーグメント
 * - items: アイテム
 */
export async function getTftDisplayMaps() {
  const version = await getLatestDdragonVersion();

  const [championJson, traitJson, augmentJson, itemJson] = await Promise.all([
    fetchTftJson(version, "tft-champion.json"),
    fetchTftJson(version, "tft-trait.json"),
    fetchTftJson(version, "tft-augments.json"),
    fetchTftJson(version, "tft-item.json"),
  ]);

  return {
    champions: toDisplayMap(version, championJson),
    traits: toDisplayMap(version, traitJson),
    augments: toDisplayMap(version, augmentJson),

    /**
     * TFTアイテム一覧
     *
     * 例:
     * TFT_Item_GuinsoosRageblade
     * ↓
     * 日本語名 + アイテム画像URL
     */
    items: toDisplayMap(version, itemJson),
  };
}
