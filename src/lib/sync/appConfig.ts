import { prisma } from "@/lib/prisma";

export async function getAppConfig() {
  return prisma.appConfig.findUnique({
    where: {
      id: "default",
    },
  });
}

/**
 * AppConfigからPUUIDを取得する
 *
 * sync-profile 実行前は puuid がないため、
 * 各同期APIではここで明示的にエラーにする。
 */
export async function getConfiguredPuuid() {
  const appConfig = await getAppConfig();

  if (!appConfig?.puuid) {
    throw new Error(
      "AppConfig.puuidが未設定です。先に /api/sync-profile を実行してください。"
    );
  }

  return appConfig.puuid;
}

async function updateSyncTime(
  field:
    | "lastProfileSync"
    | "lastMatchSync"
    | "lastRankSync"
    | "lastTftMatchSync"
    | "lastTftRankSync"
) {
  await prisma.appConfig.update({
    where: {
      id: "default",
    },
    data: {
      [field]: new Date(),
    },
  });
}

export async function updateLastProfileSync() {
  return updateSyncTime("lastProfileSync");
}

export async function updateLastMatchSync() {
  return updateSyncTime("lastMatchSync");
}

export async function updateLastRankSync() {
  return updateSyncTime("lastRankSync");
}

export async function updateLastTftMatchSync() {
  return updateSyncTime("lastTftMatchSync");
}

export async function updateLastTftRankSync() {
  return updateSyncTime("lastTftRankSync");
}
