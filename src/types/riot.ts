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

/**
 * LoL試合詳細のレスポンス型
 * Riot Match V5 API より
 */
export type RiotMatchDetail = {
  metadata: {
    matchId: string;
  };
  info: {
    gameCreation?: number;
    gameStartTimestamp?: number;
    gameEndTimestamp?: number;
    gameDuration?: number;
    gameVersion: string;
    queueId: number;
    gameMode: string;
    participants: RiotParticipant[];
    teams: RiotTeam[];
  };
};

export type RiotParticipant = {
  puuid: string;
  riotIdGameName?: string;
  riotIdTagline?: string;
  participantId: number;
  teamId: number;
  championId: number;
  championName: string;
  teamPosition?: string;
  individualPosition?: string;
  win: boolean;

  kills: number;
  deaths: number;
  assists: number;

  champLevel?: number;
  goldEarned?: number;
  totalMinionsKilled?: number;
  neutralMinionsKilled?: number;
  totalDamageDealtToChampions?: number;
  totalDamageTaken?: number;
  visionScore?: number;
  wardsPlaced?: number;
  wardsKilled?: number;

  summoner1Id?: number;
  summoner2Id?: number;

  item0?: number;
  item1?: number;
  item2?: number;
  item3?: number;
  item4?: number;
  item5?: number;
  item6?: number;
};

export type RiotTeam = {
  teamId: number;
  win: boolean;
  objectives?: {
    baron?: { kills?: number; first?: boolean };
    dragon?: { kills?: number; first?: boolean };
    riftHerald?: { kills?: number; first?: boolean };
    tower?: { kills?: number; first?: boolean };
    inhibitor?: { kills?: number; first?: boolean };
    champion?: { first?: boolean };
  };
};
