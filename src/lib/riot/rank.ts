import type { RiotLeagueEntry } from "@/types/riot";
import { LOL_API_BASE_URL, getRiotHeaders } from "./shared";

/**
 * PUUIDからランク情報を取得する
 */
export async function getLeagueEntriesByPuuid(
  puuid: string
): Promise<RiotLeagueEntry[]> {
  const response = await fetch(
    `${LOL_API_BASE_URL}/lol/league/v4/entries/by-puuid/${encodeURIComponent(
      puuid
    )}`,
    {
      headers: getRiotHeaders(),
      cache: "no-store",
    }
  );

  if (!response.ok) {
    const errorBody = await response.text();

    console.error("League API Error", {
      status: response.status,
      body: errorBody,
      puuid,
    });

    throw new Error(`Failed to fetch league entries: ${response.status}`);
  }

  return response.json();
}
