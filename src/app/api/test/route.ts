import {
  getAccount,
  getMatchIds,
  getMatch,
  extractMyParticipant,
} from "@/src/lib/riot";

export async function GET() {
  const account = await getAccount();

  const matchIds = await getMatchIds(account.puuid, 1);

  const match = await getMatch(matchIds[0]);

  const me = extractMyParticipant(match, account.puuid);

  return Response.json({
    champion: me.championName,
    win: me.win,
    kills: me.kills,
    deaths: me.deaths,
    assists: me.assists,
    gameMode: match.info.gameMode,
  });
}
