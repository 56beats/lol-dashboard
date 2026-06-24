/**
 * Riot APIのgameVersionからパッチ番号を作る
 *
 * 例:
 * 16.12.674.1234 -> 16.12
 */
export function resolvePatch(gameVersion: string) {
  const [major, minor] = gameVersion.split(".");

  return `${major}.${minor}`;
}

/**
 * Riot APIのミリ秒timestampをDateへ変換する
 */
export function toDate(timestamp?: number) {
  return timestamp ? new Date(timestamp) : new Date();
}
