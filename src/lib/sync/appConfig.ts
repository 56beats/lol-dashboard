import { prisma } from "@/lib/prisma";

export async function getAppConfig() {
  return prisma.appConfig.findUnique({
    where: {
      id: "default",
    },
  });
}

export async function getConfiguredAccount(accountId?: string | null) {
  if (accountId) {
    return prisma.riotAccount.findUnique({
      where: {
        id: accountId,
      },
    });
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
    return primaryAccount;
  }

  return prisma.riotAccount.findFirst({
    orderBy: {
      createdAt: "asc",
    },
  });
}

/**
 * 指定アカウントまたはプライマリアカウントのPUUIDを取得する
 */
export async function getConfiguredPuuid(accountId?: string | null) {
  const account = await getConfiguredAccount(accountId);

  if (!account?.puuid) {
    throw new Error(
      "RiotアカウントのPUUIDが未設定です。先に /api/sync-profile を実行してください。"
    );
  }

  return account.puuid;
}

async function updateSyncTime(
  field:
    | "lastProfileSync"
    | "lastMatchSync"
    | "lastRankSync"
    | "lastTftMatchSync"
    | "lastTftRankSync",
  accountId?: string | null
) {
  const resolvedAccount = await getConfiguredAccount(accountId);

  if (!resolvedAccount) {
    return;
  }

  await prisma.riotAccount.update({
    where: {
      id: resolvedAccount.id,
    },
    data: {
      [field]: new Date(),
    },
  });
}

export async function updateLastProfileSync(accountId?: string | null) {
  return updateSyncTime("lastProfileSync", accountId);
}

export async function updateLastMatchSync(accountId?: string | null) {
  return updateSyncTime("lastMatchSync", accountId);
}

export async function updateLastRankSync(accountId?: string | null) {
  return updateSyncTime("lastRankSync", accountId);
}

export async function updateLastTftMatchSync(accountId?: string | null) {
  return updateSyncTime("lastTftMatchSync", accountId);
}

export async function updateLastTftRankSync(accountId?: string | null) {
  return updateSyncTime("lastTftRankSync", accountId);
}
