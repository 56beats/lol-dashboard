/**
 * Riot Data Dragon関連
 */

const DDRAGON_BASE_URL = "https://ddragon.leagueoflegends.com";

/**
 * Data Dragonで使えるバージョン一覧を取得する
 */
export async function getDdragonVersions(): Promise<string[]> {
  const response = await fetch(`${DDRAGON_BASE_URL}/api/versions.json`, {
    cache: "force-cache",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch Data Dragon versions");
  }

  return response.json();
}

/**
 * match.info.gameVersion からData Dragonに存在する近いバージョンを探す
 *
 * 例:
 * gameVersion = 15.24.724.1234
 * versions = ["15.24.1", "15.23.1", ...]
 * ↓
 * "15.24.1" を返す
 */
export async function resolveDdragonVersion(gameVersion?: string | null) {
  const versions = await getDdragonVersions();

  if (!gameVersion) {
    return versions[0];
  }

  const [major, minor] = gameVersion.split(".");
  const prefix = `${major}.${minor}.`;

  const matchedVersion = versions.find((version) => version.startsWith(prefix));

  return matchedVersion ?? versions[0];
}

/**
 * チャンピオン画像URL
 */
export function getChampionImageUrl(champion: string, version: string) {
  return `${DDRAGON_BASE_URL}/cdn/${version}/img/champion/${champion}.png`;
}

/**
 * アイテム画像URL
 */
export function getItemImageUrl(itemId: number, version: string) {
  return `${DDRAGON_BASE_URL}/cdn/${version}/img/item/${itemId}.png`;
}

/**
 * Data Dragonから日本語チャンピオン名一覧を取得する
 *
 * 画面表示用なので、基本は最新バージョンで取得してよい。
 * 古い試合でもチャンピオン名は大きく変わらないため。
 */
export async function getJapaneseChampionMap() {
  const version = "15.24.1";

  const response = await fetch(
    `https://ddragon.leagueoflegends.com/cdn/${version}/data/ja_JP/champion.json`,
    {
      cache: "force-cache",
    }
  );

  const json = await response.json();

  const championMap: Record<string, string> = {};

  for (const champion of Object.values<any>(json.data)) {
    championMap[champion.id] = champion.name;
  }

  return championMap;
}
