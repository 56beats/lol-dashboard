import type { RiotLeagueEntry } from "@/types/riot";
import { LOL_API_BASE_URL, riotFetch } from "./shared";

/**
 * PUUIDからランク情報を取得する
 *
 * 注: エラー時はコンソールにエラー詳細ログを出力
 * （デバッグに必要なため、呼び出し側でのみ行う）
 */
export async function getLeagueEntriesByPuuid(
  puuid: string
): Promise<RiotLeagueEntry[]> {
  const url = `${LOL_API_BASE_URL}/lol/league/v4/entries/by-puuid/${encodeURIComponent(
    puuid
  )}`;

  try {
    return await riotFetch<RiotLeagueEntry[]>(url);
  } catch (error) {
    // ドメイン固有のデバッグログ（呼び出し側で実施）
    console.error("League API Error", { error, puuid });
    throw error;
  }
}
