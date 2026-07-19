import { ACCOUNT_API_BASE_URL, riotFetch } from "@/lib/riot/shared";
import type { RiotTftMatchDetail } from "@/types/tft";

/**
 * TFT試合ID一覧取得
 */
export async function getTftMatchIds(puuid: string, count = 20) {
  const url = `${ACCOUNT_API_BASE_URL}/tft/match/v1/matches/by-puuid/${encodeURIComponent(
    puuid
  )}/ids?count=${count}`;

  return riotFetch<string[]>(url);
}

/**
 * TFT試合詳細取得
 */
export async function getTftMatch(matchId: string) {
  const url = `${ACCOUNT_API_BASE_URL}/tft/match/v1/matches/${encodeURIComponent(matchId)}`;

  return riotFetch<RiotTftMatchDetail>(url);
}
