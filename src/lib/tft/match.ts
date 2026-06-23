import { ACCOUNT_API_BASE_URL } from "@/lib/riot/shared";
import { getRiotHeaders } from "@/lib/riot/shared";

/**
 * TFT試合ID一覧取得
 */
export async function getTftMatchIds(puuid: string, count = 20) {
  const response = await fetch(
    `${ACCOUNT_API_BASE_URL}/tft/match/v1/matches/by-puuid/${puuid}/ids?count=${count}`,
    {
      headers: getRiotHeaders(),
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch TFT match ids: ${response.status}`);
  }

  return response.json();
}

/**
 * TFT試合詳細取得
 */
export async function getTftMatch(matchId: string) {
  const response = await fetch(
    `${ACCOUNT_API_BASE_URL}/tft/match/v1/matches/${matchId}`,
    {
      headers: getRiotHeaders(),
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch TFT match: ${response.status}`);
  }

  return response.json();
}
