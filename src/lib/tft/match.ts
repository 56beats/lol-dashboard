import { ACCOUNT_API_BASE_URL, riotFetch } from "@/lib/riot/shared";
import type { RiotTftMatchDetail } from "@/types/tft";

/**
 * TFT隧ｦ蜷・D荳隕ｧ蜿門ｾ・
 */
export async function getTftMatchIds(puuid: string, count = 20) {
  const url = `${ACCOUNT_API_BASE_URL}/tft/match/v1/matches/by-puuid/${encodeURIComponent(
    puuid
  )}/ids?count=${count}`;

  return riotFetch<string[]>(url, "tft");
}

/**
 * TFT隧ｦ蜷郁ｩｳ邏ｰ蜿門ｾ・
 */
export async function getTftMatch(matchId: string) {
  const url = `${ACCOUNT_API_BASE_URL}/tft/match/v1/matches/${encodeURIComponent(matchId)}`;

  return riotFetch<RiotTftMatchDetail>(url, "tft");
}

