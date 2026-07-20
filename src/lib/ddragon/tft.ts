/**
 * TFT チャンピオン画像URL生成用ユーティリティ
 *
 * CommunityDragon（高品質）と Data Dragon（低品質）の2ソースをサポート
 */

import { getDdragonVersions, getTftChampionImageUrl } from "./shared";

/**
 * 最新 Data Dragon バージョンを取得する
 *
 * TFT チャンピオン同期時に呼ぶ。
 * キャッシュ: force-cache（バージョン一覧は安定）
 */
export async function fetchLatestDDragonVersion(): Promise<string> {
  const versions = await getDdragonVersions();
  return versions[0];
}

/**
 * CommunityDragon から TFT チャンピオン画像URL を取得
 *
 * 高品質なスプラッシュアート画像を提供する
 *
 * 例: championId="TFT17_Aatrox"
 * → https://raw.communitydragon.org/latest/game/assets/ux/tft/championsplashes/.../tft17_aatrox_teamplanner_splash.tft_set17.png
 *
 * セット番号が取得できない場合は undefined を返す。
 * Step 2 の isStandardTftChampionId フィルタを通過したIDであれば通常は到達しない。
 */
export function getCDragonChampionImageUrl(championId: string): string | undefined {
  const lowerId = championId.toLowerCase();

  // TFT17_Aatrox → 17
  const setNumber = championId.match(/^TFT(\d+)_/)?.[1];

  if (!setNumber) {
    // Step 2のフィルタで通常は到達しない。万一の場合は undefined で継続する
    return undefined;
  }

  return [
    "https://raw.communitydragon.org",
    "latest",
    "game",
    "assets",
    "ux",
    "tft",
    "championsplashes",
    "patching",
    `${lowerId}_teamplanner_splash.tft_set${setNumber}.png`,
  ].join("/");
}

/**
 * Data Dragon から TFT チャンピオン画像URL を取得
 *
 * CommunityDragon が利用できない場合の代替
 *
 * 例: imageFull="TFT17_Aatrox.png", version="15.24.1"
 * → https://ddragon.leagueoflegends.com/cdn/15.24.1/img/tft-champion/TFT17_Aatrox.png
 */
export function getDDragonChampionImageUrl(
  version: string,
  imageFull: string
): string {
  return getTftChampionImageUrl(imageFull, version);
}
