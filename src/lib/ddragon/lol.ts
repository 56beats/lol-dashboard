/**
 * LoL チャンピオン同期用 Data Dragon ユーティリティ
 */

import { getDdragonVersions, getLoLChampionImageUrl } from "./shared";

/**
 * 最新 Data Dragon バージョンを取得する
 *
 * チャンピオン同期時に呼ぶ。
 * キャッシュ: force-cache（バージョン一覧は安定）
 */
export async function fetchLatestDDragonVersion(): Promise<string> {
  const versions = await getDdragonVersions();
  return versions[0];
}

/**
 * LoL チャンピオン画像URL を生成する
 *
 * 例: championId="Ahri", version="15.24.1"
 * → https://ddragon.leagueoflegends.com/cdn/15.24.1/img/champion/Ahri.png
 */
export function getLolChampionImageUrl(
  version: string,
  championId: string
): string {
  return getLoLChampionImageUrl(championId, version);
}
