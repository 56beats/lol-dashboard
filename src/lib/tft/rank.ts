import { LOL_API_BASE_URL } from "@/lib/riot/shared";
import { getRiotHeaders } from "@/lib/riot/shared";

/**
 * TFTランク取得
 */
export async function getTftLeagueEntriesByPuuid(puuid: string) {
  const response = await fetch(
    `${LOL_API_BASE_URL}/tft/league/v1/by-puuid/${puuid}`,
    {
      headers: getRiotHeaders(),
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch TFT rank: ${response.status}`);
  }

  return response.json();
}
