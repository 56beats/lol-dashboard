/**
 * TFT 画面表示用 Data Dragon ユーティリティ
 *
 * ユニット・特性・オーグメント・アイテムの日本語名と画像を一括取得する
 */

import { getDdragonVersions } from "./shared";

const DDRAGON_BASE_URL = "https://ddragon.leagueoflegends.com";

/**
 * Data Dragon で取得したTFTデータのレスポンス型
 *
 * データ構造: { data: { [id]: { id, name, image: { group, full } } } }
 * 例:
 * {
 *   "data": {
 *     "TFT17_Aatrox": {
 *       "id": "TFT17_Aatrox",
 *       "name": "アトロックス",
 *       "image": {
 *         "group": "tft-champion",
 *         "full": "TFT17_Aatrox.png"
 *       }
 *     },
 *     ...
 *   }
 * }
 */
type TftDdragonResponse = {
  data: Record<
    string,
    {
      id: string;
      name: string;
      image?: {
        group: string;
        full: string;
      };
    }
  >;
};

/**
 * 表示用に変換したTFTデータ
 */
export type TftDisplayData = {
  id: string;
  name: string;
  imageUrl?: string;
};

/**
 * Data Dragon で利用可能な最新バージョンを取得する
 *
 * キャッシュ: force-cache（バージョン一覧は安定）
 */
async function getLatestDdragonVersion(): Promise<string> {
  const versions = await getDdragonVersions();
  return versions[0];
}

/**
 * Data Dragon JSON を取得する
 *
 * @param version - Data Dragon バージョン
 * @param fileName - JSON ファイル名 (例: tft-champion.json, tft-trait.json)
 * @returns パースされた JSON データ
 *
 * キャッシュ: force-cache（このデータは変わらない）
 */
async function fetchTftJson(
  version: string,
  fileName: string
): Promise<TftDdragonResponse> {
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
 * Data Dragon JSON を id => 表示情報 の Map へ変換する
 *
 * DBには "TFT17_Kindred" のようなIDだけ保存しているため、
 * 画面表示時にこの Map を使って日本語名と画像URL へ変換する。
 */
function toDisplayMap(
  version: string,
  json: TftDdragonResponse
): Record<string, TftDisplayData> {
  const map: Record<string, TftDisplayData> = {};

  for (const item of Object.values(json.data)) {
    map[item.id] = {
      id: item.id,
      name: item.name,

      // fullはカードアート・スプラッシュ画像の場合がある
      imageUrl: item.image
        ? `${DDRAGON_BASE_URL}/cdn/${version}/img/${item.image.group}/${item.image.full}`
        : undefined,
    };
  }

  return map;
}

/**
 * TFT の日本語名・画像情報をまとめて取得する
 *
 * 返却する Map:
 * - champions: ユニット（TFT17_Aatroxなど）
 * - traits: 特性（例: 帝国）
 * - augments: オーグメント（例: 強襲）
 * - items: アイテム（例: グインソーの怒り）
 *
 * キャッシュ: force-cache（バージョン内でこのデータは変わらない）
 *
 * 用途: src/app/page.tsx で initial props を準備し、
 *       各コンポーネント（TftMatchCard など）で表示時に参照
 */
export async function getTftDisplayMaps() {
  const version = await getLatestDdragonVersion();

  // 4つのJSON を並列取得
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
    items: toDisplayMap(version, itemJson),
  };
}
