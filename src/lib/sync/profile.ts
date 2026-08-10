import { prisma } from "@/lib/prisma";
import { getAccount } from "@/lib/riot";

/**
 * Riot ID からプロフィール情報を取得してDB保存する
 *
 * 既存の AppConfig は互換性維持のため残しつつ、
 * 追加された RiotAccount へも保存する。
 */
export async function syncProfile(options?: {
  accountId?: string | null;
  gameName?: string;
  tagLine?: string;
  createNew?: boolean;
}): Promise<{
  gameName: string;
  tagLine: string;
  accountId?: string;
}> {
  const resolvedAccount = options?.accountId
    ? await prisma.riotAccount.findUnique({
        where: { id: options.accountId },
      })
    : await prisma.riotAccount.findFirst({
        where: { isPrimary: true },
        orderBy: { createdAt: "asc" },
      });

  const account = await getAccount({
    gameName: options?.gameName ?? resolvedAccount?.gameName ?? undefined,
    tagLine: options?.tagLine ?? resolvedAccount?.tagLine ?? undefined,
  });

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

  if (options?.accountId) {
    const updatedAccount = await prisma.riotAccount.update({
      where: {
        id: options.accountId,
      },
      data: {
        gameName: account.gameName,
        tagLine: account.tagLine,
        puuid: account.puuid,
        lastProfileSync: new Date(),
      },
    });

    return {
      gameName: account.gameName,
      tagLine: account.tagLine,
      accountId: updatedAccount.id,
    };
  }

  if (options?.createNew) {
    const createdAccount = await prisma.riotAccount.create({
      data: {
        gameName: account.gameName,
        tagLine: account.tagLine,
        puuid: account.puuid,
        isPrimary: false,
        lastProfileSync: new Date(),
      },
    });

    return {
      gameName: account.gameName,
      tagLine: account.tagLine,
      accountId: createdAccount.id,
    };
  }

  const primaryAccount = await prisma.riotAccount.findFirst({
    where: {
      isPrimary: true,
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  if (primaryAccount) {
    const updatedAccount = await prisma.riotAccount.update({
      where: {
        id: primaryAccount.id,
      },
      data: {
        gameName: account.gameName,
        tagLine: account.tagLine,
        puuid: account.puuid,
        lastProfileSync: new Date(),
      },
    });

    return {
      gameName: account.gameName,
      tagLine: account.tagLine,
      accountId: updatedAccount.id,
    };
  }

  const createdPrimaryAccount = await prisma.riotAccount.create({
    data: {
      gameName: account.gameName,
      tagLine: account.tagLine,
      puuid: account.puuid,
      isPrimary: true,
      lastProfileSync: new Date(),
    },
  });

  return {
    gameName: account.gameName,
    tagLine: account.tagLine,
    accountId: createdPrimaryAccount.id,
  };
}
