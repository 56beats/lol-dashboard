/**
 * Riot API共通設定
 *
 * APIキーやベースURLを1箇所にまとめておくと、
 * 後からTFT対応や地域変更をするときに修正箇所が少なくなる。
 */

export const API_KEY = process.env.RIOT_API_KEY!;

export const ACCOUNT_API_BASE_URL = "https://asia.api.riotgames.com";
export const LOL_API_BASE_URL = "https://jp1.api.riotgames.com";

/**
 * Riot APIへ渡す共通ヘッダー
 */
export function getRiotHeaders() {
  return {
    "X-Riot-Token": API_KEY,
  };
}
