import { prisma } from "@/lib/prisma";
import { resolveDdragonVersion } from "@/lib/ddragon/shared";

type LolMatchForDisplay = {
  id: string;
  champion: string;
  championJa: string;
  win: boolean;
  kills: number;
  deaths: number;
  assists: number;
  gameMode: string;
  queueId: number | null;
  playedAt: Date;
  itemIds: number[];
  ddragonVersion: string;
  participants: Array<{
    puuid: string;
    isMe: boolean;
    riotIdGameName: string | null;
    riotIdTagline: string | null;
    teamId: number;
    championName: string;
    championJa: string;
    championImageUrl?: string;
    kills: number;
    deaths: number;
    assists: number;
    totalMinionsKilled: number | null;
    neutralMinionsKilled: number | null;
    totalDamageDealtToChampions: number | null;
    visionScore: number | null;
    summoner1Id: number | null;
    summoner2Id: number | null;
    itemIds: number[];
  }>;
};

type LolStats = {
  wins: number;
  losses: number;
  winRate: number;
  totalKills: number;
  totalDeaths: number;
  totalAssists: number;
  avgKda: string;
};

/**
 * LoLマッチデータを取得し、表示用形式へ変換する
 *
 * DBの新しいLoL試合構造から最近20試合を取得し、
 * 各参加者の詳細情報を含む形へ変換する。
 */
export async function getLolMatchesForDisplay(
  myPuuid: string | null | undefined
): Promise<LolMatchForDisplay[]> {
  if (!myPuuid) {
    return [];
  }

  const lolMatches = await prisma.lolMatch.findMany({
    orderBy: {
      playedAt: "desc",
    },
    take: 20,
    include: {
      participants: {
        orderBy: [{ teamId: "asc" }, { participantId: "asc" }],
      },
    },
  });

  // LoLチャンピオン情報をDBから取得
  const lolChampions = await prisma.lolChampion.findMany();
  const lolChampionMap = new Map(
    lolChampions.map((champion) => [champion.key, champion])
  );

  const matches = await Promise.all(
    lolMatches.map(async (match) => {
      // 自分の参加者情報を取得
      const me = match.participants.find(
        (participant) => participant.puuid === myPuuid
      );

      if (!me) {
        return null;
      }

      const champion = lolChampionMap.get(me.championId);

      return {
        id: match.matchId,
        champion: me.championName,
        championJa: champion?.nameJa ?? me.championName,
        win: me.win,
        kills: me.kills,
        deaths: me.deaths,
        assists: me.assists,
        gameMode: match.gameMode,
        queueId: match.queueId,
        playedAt: match.playedAt,
        itemIds: [
          me.item0 ?? 0,
          me.item1 ?? 0,
          me.item2 ?? 0,
          me.item3 ?? 0,
          me.item4 ?? 0,
          me.item5 ?? 0,
          me.item6 ?? 0,
        ],
        ddragonVersion: await resolveDdragonVersion(match.gameVersion),
        // クリック展開時に表示する10人分の参加者情報
        participants: match.participants.map((participant) => {
          const participantChampion = lolChampionMap.get(
            participant.championId
          );

          return {
            puuid: participant.puuid,
            isMe: participant.puuid === myPuuid,
            riotIdGameName: participant.riotIdGameName,
            riotIdTagline: participant.riotIdTagline,
            teamId: participant.teamId,
            championName: participant.championName,
            championJa: participantChampion?.nameJa ?? participant.championName,
            championImageUrl: participantChampion?.imageUrl,
            kills: participant.kills,
            deaths: participant.deaths,
            assists: participant.assists,
            totalMinionsKilled: participant.totalMinionsKilled,
            neutralMinionsKilled: participant.neutralMinionsKilled,
            totalDamageDealtToChampions:
              participant.totalDamageDealtToChampions,
            visionScore: participant.visionScore,
            summoner1Id: participant.summoner1Id,
            summoner2Id: participant.summoner2Id,
            itemIds: [
              participant.item0 ?? 0,
              participant.item1 ?? 0,
              participant.item2 ?? 0,
              participant.item3 ?? 0,
              participant.item4 ?? 0,
              participant.item5 ?? 0,
              participant.item6 ?? 0,
            ],
          };
        }),
      };
    })
  ).then((matches) =>
    matches.filter(
      (match): match is NonNullable<typeof match> => match !== null
    )
  );

  return matches;
}

/**
 * LoLマッチデータから集計統計を計算する
 */
export function calculateLolStats(
  matches: LolMatchForDisplay[]
): LolStats {
  const wins = matches.filter((m) => m.win).length;
  const losses = matches.length - wins;
  const winRate = matches.length > 0 ? Math.round((wins / matches.length) * 100) : 0;

  const totalKills = matches.reduce((sum, m) => sum + m.kills, 0);
  const totalDeaths = matches.reduce((sum, m) => sum + m.deaths, 0);
  const totalAssists = matches.reduce((sum, m) => sum + m.assists, 0);

  const avgKda =
    totalDeaths === 0
      ? "Perfect"
      : ((totalKills + totalAssists) / totalDeaths).toFixed(2);

  return {
    wins,
    losses,
    winRate,
    totalKills,
    totalDeaths,
    totalAssists,
    avgKda,
  };
}
