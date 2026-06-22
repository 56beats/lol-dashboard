import { formatLpDiff } from "@/lib/rank";

type Props = {
  tier?: string;
  rank?: string;
  lp?: number;
  wins?: number;
  losses?: number;
  lpDiff?: number;
};

/**
 * 現在ランクを表示するカード
 */
export function RankCard({ tier, rank, lp, wins, losses, lpDiff }: Props) {
  if (!tier || !rank || lp == null || wins == null || losses == null) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-lg backdrop-blur">
        <div className="text-sm text-slate-400">現在ランク</div>
        <div className="mt-3 text-2xl font-bold text-white">未取得</div>
        <div className="mt-2 text-sm text-slate-400">
          LP同期を押すと表示されます
        </div>
      </div>
    );
  }

  const totalGames = wins + losses;
  const winRate = totalGames > 0 ? Math.round((wins / totalGames) * 100) : 0;

  return (
    <div className="rounded-2xl border border-emerald-400/30 bg-emerald-400/10 p-5 shadow-lg backdrop-blur">
      <div className="text-sm text-emerald-200">現在ランク</div>

      <div className="mt-3 text-3xl font-bold text-white">
        {tier} {rank}
      </div>

      <div className="mt-1 text-2xl font-bold text-emerald-300">{lp} LP</div>

      {lpDiff != null && (
        <div
          className={[
            "mt-2 text-sm font-bold",
            lpDiff >= 0 ? "text-sky-300" : "text-rose-300",
          ].join(" ")}
        >
          前回比 {formatLpDiff(lpDiff)}
        </div>
      )}

      <div className="mt-3 text-sm text-slate-300">
        {wins}勝 {losses}敗 / 勝率 {winRate}%
      </div>
    </div>
  );
}
