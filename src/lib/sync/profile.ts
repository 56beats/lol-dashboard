import { prisma } from "@/lib/prisma";
import { getAccount } from "@/lib/riot";

/**
 * Riot ID からプロフィール情報を取得してDB保存する
 *
 * 画面表示では Riot API を直接叩かず、
 * ここで保存した AppConfig を参照するようにする。
 */
export async function syncProfile(): Promise<{
  gameName: string;
  tagLine: string;
}> {
  const account = await getAccount();

  await prisma.appConfig.upsert({
    where: {
      id: "default",
    },
    update: {
      riotGameName: account.gameName,
      riotTagLine: account.tagLine,
      puuid: account.puuid,
      lastProfileSync: new Date(),
    },
    create: {
      id: "default",
      riotGameName: account.gameName,
      riotTagLine: account.tagLine,
      puuid: account.puuid,
      lastProfileSync: new Date(),
    },
  });

  return {
    gameName: account.gameName,
    tagLine: account.tagLine,
  };
}
