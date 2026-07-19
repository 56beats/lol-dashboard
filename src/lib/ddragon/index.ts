/**
 * Data Dragon 関連ユーティリティの公開API
 *
 * 構成:
 * - shared: 低レベル通信（バージョン取得、URL生成）
 * - lol: LoL 専用（パッチ解決、チャンピオン同期用）
 * - tft: TFT 画像URL生成（CommunityDragon + Data Dragon）
 * - tftDisplay: TFT 表示用（日本語名・画像一括取得）
 */

// Low-level communication
export {
  getDdragonVersions,
  resolveDdragonVersion,
  getLoLChampionImageUrl,
  getLoLItemImageUrl,
  getTftChampionImageUrl,
} from "./shared";

// LoL
export {
  fetchLatestDDragonVersion as fetchLatestDDragonVersionLoL,
  getLolChampionImageUrl,
} from "./lol";

// TFT
export {
  fetchLatestDDragonVersion as fetchLatestDDragonVersionTft,
  getCDragonChampionImageUrl,
  getDDragonChampionImageUrl,
} from "./tft";

// TFT Display
export { getTftDisplayMaps, type TftDisplayData } from "./tftDisplay";
