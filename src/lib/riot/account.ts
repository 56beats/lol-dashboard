import { ACCOUNT_API_BASE_URL, getRiotHeaders } from "./shared";

/**
 * Riot IDからAccount情報を取得する
 *
 * 56beats#3460
 * ↓
 * PUUIDを取得する
 */
export async function getAccount() {
  const gameName = process.env.RIOT_GAME_NAME!;
  const tagLine = process.env.RIOT_TAG_LINE!;

  const response = await fetch(
    `${ACCOUNT_API_BASE_URL}/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(
      gameName
    )}/${encodeURIComponent(tagLine)}`,
    {
      headers: getRiotHeaders(),
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch account: ${response.status}`);
  }

  return response.json();
}
