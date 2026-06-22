/**
 * Riot APIから返るランク情報
 * 今使う項目だけ定義しておく
 */
export type RiotLeagueEntry = {
  queueType: string;
  tier: string;
  rank: string;
  leaguePoints: number;
  wins: number;
  losses: number;
};
