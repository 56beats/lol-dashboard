/**
 * LoLチャンピオン画像まわりの共通処理
 */

const DDRAGON_VERSION_URL =
  "https://ddragon.leagueoflegends.com/api/versions.json";

/**
 * 最新Data Dragonバージョンを取得する
 */
export async function fetchLatestDDragonVersion() {
  const res = await fetch(DDRAGON_VERSION_URL, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Data Dragonのバージョン取得に失敗しました");
  }

  const versions = (await res.json()) as string[];

  return versions[0];
}

/**
 * LoLチャンピオン画像URLを作る
 */
export function getLolChampionImageUrl(version: string, championId: string) {
  return `https://ddragon.leagueoflegends.com/cdn/${version}/img/champion/${championId}.png`;
}

/**
 * 16.12.1 -> 16.12 に変換する
 */
export function resolvePatch(version: string) {
  const [major, minor] = version.split(".");
  return `${major}.${minor}`;
}
