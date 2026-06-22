import { prisma } from "@/lib/prisma";

import {
  getAccount,
  getMatch,
  getMatchIds,
  extractMyParticipant,
} from "@/lib/riot";

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
        queueId: match.info.queueId,

        // その試合が行われたLoLクライアントのバージョン
        // チャンピオン画像・アイテム画像を当時のバージョンで表示するために保存する
        gameVersion: match.info.gameVersion,

        item0: me.item0,
        item1: me.item1,
        item2: me.item2,
        item3: me.item3,
        item4: me.item4,
        item5: me.item5,
        item6: me.item6,

        playedAt: new Date(match.info.gameCreation),
      },
    });

    saved++;
  }

  return Response.redirect(new URL("/", request.url));
}
