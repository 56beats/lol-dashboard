/**
 * ランクを数値化するためのユーティリティ
 *
 * そのままLPだけでグラフ化すると、
 * GOLD IV 90LP → GOLD III 10LP が「90 → 10」に見えて下がったように見える。
 *
 * そのため、tier / rank / lp を合算した内部スコアに変換する。
 */

const TIER_BASE: Record<string, number> = {
  IRON: 0,
  BRONZE: 400,
  SILVER: 800,
  GOLD: 1200,
  PLATINUM: 1600,
  EMERALD: 2000,
  DIAMOND: 2400,
  MASTER: 2800,
  GRANDMASTER: 3000,
  CHALLENGER: 3200,
};

const DIVISION_BASE: Record<string, number> = {
  IV: 0,
  III: 100,
  II: 200,
  I: 300,
};

/**
 * tier/rank/lp をグラフ用の数値に変換する
 */
export function calculateRankScore(tier: string, rank: string, lp: number) {
  const tierBase = TIER_BASE[tier] ?? 0;
  const divisionBase = DIVISION_BASE[rank] ?? 0;

  return tierBase + divisionBase + lp;
}

/**
 * 前回との差分を表示用文字列にする
 */
export function formatLpDiff(diff: number) {
  if (diff > 0) return `+${diff} LP`;
  if (diff < 0) return `${diff} LP`;
  return "±0 LP";
}

/**
 * Emerald IV → E4
 * Gold II → G2
 */
export function formatShortRank(tier: string, rank: string) {
  const tierMap: Record<string, string> = {
    IRON: "I",
    BRONZE: "B",
    SILVER: "S",
    GOLD: "G",
    PLATINUM: "P",
    EMERALD: "E",
    DIAMOND: "D",
    MASTER: "M",
    GRANDMASTER: "GM",
    CHALLENGER: "C",
  };

  const divisionMap: Record<string, string> = {
    IV: "4",
    III: "3",
    II: "2",
    I: "1",
  };

  return `${tierMap[tier] ?? tier}${divisionMap[rank] ?? rank}`;
}

/**
 * Emerald IV 10LP → E4.10 のように短く表示する
 */
export function formatShortRankWithLp(tier: string, rank: string, lp: number) {
  return `${formatShortRank(tier, rank)}.${lp}`;
}
