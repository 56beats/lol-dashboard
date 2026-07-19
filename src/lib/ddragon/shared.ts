/**
 * Data Dragon 低レベル通信
 *
 * 責務: バージョン取得、画像URL生成のみ
 * 含まない: ドメイン固有処理、データ変換、キャッシュ戦略（実装は呼び出し側）
 */

const DDRAGON_BASE_URL = "https://ddragon.leagueoflegends.com";

/**
 * Data Dragon で利用可能なバージョン一覧を取得する
 *
 * 戻り値: 最新順の バージョン配列（例: ["15.24.1", "15.23.1", ...]）
 * キャッシュ: force-cache（めったに更新されない）
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
 * match.info.gameVersion から Data Dragon に存在する近いバージョンを探す
 *
 * 例:
 * gameVersion = 15.24.724.1234
 * versions = ["15.24.1", "15.23.1", ...]
 * ↓
 * "15.24.1" を返す
 *
 * gameVersion が null の場合は最新バージョンを返す
 */
export async function resolveDdragonVersion(gameVersion?: string | null): Promise<string> {
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
 * LoL チャンピオン画像URL
 *
 * 例: version=15.24.1, championId=Ahri
 * → https://ddragon.leagueoflegends.com/cdn/15.24.1/img/champion/Ahri.png
 */
export function getLoLChampionImageUrl(
  championId: string,
  version: string
): string {
  return `${DDRAGON_BASE_URL}/cdn/${version}/img/champion/${championId}.png`;
}

/**
 * LoL アイテム画像URL
 *
 * 例: version=15.24.1, itemId=3072
 * → https://ddragon.leagueoflegends.com/cdn/15.24.1/img/item/3072.png
 */
export function getLoLItemImageUrl(itemId: number, version: string): string {
  return `${DDRAGON_BASE_URL}/cdn/${version}/img/item/${itemId}.png`;
}

/**
 * TFT チャンピオン画像URL (Data Dragon)
 *
 * imageFull は Data Dragon JSON から取得する値
 * 例: imageFull=TFT17_Aatrox.png, version=15.24.1
 * → https://ddragon.leagueoflegends.com/cdn/15.24.1/img/tft-champion/TFT17_Aatrox.png
 */
export function getTftChampionImageUrl(
  imageFull: string,
  version: string
): string {
  return `${DDRAGON_BASE_URL}/cdn/${version}/img/tft-champion/${imageFull}`;
}
