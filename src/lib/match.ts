/**
 * Riot APIのqueueIdを画面表示用に変換する
 */
export function formatQueueType(queueId?: number | null, gameMode?: string) {
  const queueMap: Record<number, string> = {
    400: "ノーマルドラフト",
    420: "ランク ソロ/デュオ",
    430: "ノーマルブラインド",
    440: "ランク フレックス",
    450: "ARAM",
    490: "クイックプレイ",
  };

  if (queueId && queueMap[queueId]) {
    return queueMap[queueId];
  }

  return gameMode ?? "不明";
}

/**
 * itemIdが0の場合は未購入枠なので表示しない
 */
export function filterItemIds(itemIds: number[]) {
  return itemIds.filter((itemId) => itemId > 0);
}

/**
 * KDAを計算する
 *
 * deathsが0の場合は割り算できないため、
 * LoLでよくある表記としてPerfectを返す。
 */
export function calcKda(kills: number, deaths: number, assists: number) {
  if (deaths === 0) return "Perfect";

  return ((kills + assists) / deaths).toFixed(2);
}
