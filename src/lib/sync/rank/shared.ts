import type { RiotLeagueEntry } from "@/types/riot";

/**
 * ランクスナップショットで保存する値（DBのカラムに対応）
 */
export type RankValues = {
  tier: string;
  rank: string;
  lp: number;
  wins: number;
  losses: number;
};

/**
 * Riot APIレスポンスからランク値を抽出
 *
 * DBのRankSnapshot/TftRankSnapshotへ保存する際に
 * 必要なフィールドだけを取り出す。
 * これにより、LoL/TFTの変更検出ロジックが共通化できる。
 */
export function extractRankValues(entry: RiotLeagueEntry): RankValues {
  return {
    tier: entry.tier,
    rank: entry.rank,
    lp: entry.leaguePoints,
    wins: entry.wins,
    losses: entry.losses,
  };
}

/**
 * 前回のランク値と現在を比較して、保存が必要かどうか判定
 *
 * @param current - 現在のランク値
 * @param previous - 前回のランク値（存在しない場合は null）
 * @returns 変更があった場合 true、その場合スナップショット保存を進める
 */
export function hasRankChanged(
  current: RankValues,
  previous: RankValues | null
): boolean {
  // 前回スナップショットがない場合は初回保存
  if (!previous) {
    return true;
  }

  // 6つのフィールドをすべて比較
  // いずれか1つでも異なればスナップショット保存対象
  return (
    current.tier !== previous.tier ||
    current.rank !== previous.rank ||
    current.lp !== previous.lp ||
    current.wins !== previous.wins ||
    current.losses !== previous.losses
  );
}
