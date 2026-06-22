import { prisma } from "@/src/lib/prisma";

import {
  getAccount,
  getMatch,
  getMatchIds,
  extractMyParticipant,
} from "@/src/lib/riot";

export async function GET(request: Request) {
  const account = await getAccount();

  const matchIds = await getMatchIds(account.puuid, 20);

  let saved = 0;

  for (const matchId of matchIds) {
    const exists = await prisma.match.findUnique({
      where: {
        id: matchId,
      },
    });

    if (exists) {
      continue;
    }

    const match = await getMatch(matchId);

    const me = extractMyParticipant(match, account.puuid);

    await prisma.match.create({
      data: {
        id: matchId,

        champion: me.championName,

        win: me.win,

        kills: me.kills,
        deaths: me.deaths,
        assists: me.assists,

        gameMode: match.info.gameMode,

        playedAt: new Date(match.info.gameCreation),
      },
    });

    saved++;
  }

  return Response.redirect(new URL("/", request.url));
}
