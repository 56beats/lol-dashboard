import { ACCOUNT_API_BASE_URL, riotFetch } from "./shared";

/**
 * Riot IDからAccount情報を取得する
 *
 * 56beats#3460
 * ↓
 * PUUIDを取得する
 */
export async function getAccount(options?: {
  gameName?: string;
  tagLine?: string;
}) {
  const gameName = options?.gameName;
  const tagLine = options?.tagLine;

  if (!gameName || !tagLine) {
    throw new Error("Riot ID が未設定です");
  }

  const url = `${ACCOUNT_API_BASE_URL}/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(
    gameName
  )}/${encodeURIComponent(tagLine)}`;

  return riotFetch<{ gameName: string; tagLine: string; puuid: string }>(
    url,
    "lol"
  );
}
