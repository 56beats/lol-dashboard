// TFTチャンピオン画像まわりの共通処理

const CDRAGON_BASE =
  "https://raw.communitydragon.org/latest/game/assets/ux/tft/championsplashes";

const DDRAGON_VERSION_URL =
  "https://ddragon.leagueoflegends.com/api/versions.json";

// CommunityDragonの画像URLを作る
/**
 * TFT17_Aatrox
 * ↓
 * tft17_aatrox_teamplanner_splash.tft_set17.png
 */
export function getCDragonChampionImageUrl(championId: string) {
  const lowerId = championId.toLowerCase();

  // TFT17_Aatrox → 17
  const setNumber = championId.match(/^TFT(\d+)_/)?.[1];

  if (!setNumber) {
    throw new Error(`セット番号を取得できませんでした: ${championId}`);
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

// Data Dragon側の保険画像URLを作る
export function getDDragonChampionImageUrl(version: string, imageFull: string) {
  return `https://ddragon.leagueoflegends.com/cdn/${version}/img/tft-champion/${imageFull}`;
}

// 最新Data Dragonバージョンを取得する
export async function fetchLatestDDragonVersion() {
  const res = await fetch(DDRAGON_VERSION_URL);

  if (!res.ok) {
    throw new Error("Data Dragonのバージョン取得に失敗しました");
  }

  const versions = (await res.json()) as string[];

  return versions[0];
}
