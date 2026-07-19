import { LOL_API_BASE_URL, riotFetch } from "@/lib/riot/shared";
import type { RiotLeagueEntry } from "@/types/riot";

/**
 * TFTランク取得
 */
export async function getTftLeagueEntriesByPuuid(
  puuid: string
): Promise<RiotLeagueEntry[]> {
  const url = `${LOL_API_BASE_URL}/tft/league/v1/by-puuid/${encodeURIComponent(puuid)}`;

  return riotFetch<RiotLeagueEntry[]>(url);
}
