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
      <div className="border-border bg-surface rounded-2xl border p-5 shadow-lg backdrop-blur">
        <div className="text-muted text-sm">現在ランク</div>
        <div className="text-foreground mt-3 text-2xl font-bold">未取得</div>
        <div className="text-muted mt-2 text-sm">
          LP同期を押すと表示されます
        </div>
      </div>
    );
  }

  const totalGames = wins + losses;
  const winRate = totalGames > 0 ? Math.round((wins / totalGames) * 100) : 0;

  return (
    <div className="border-primary bg-primary-light rounded-2xl border p-5 shadow-lg backdrop-blur">
      <div className="text-primary text-sm">現在ランク</div>

      <div className="text-foreground mt-3 text-3xl font-bold">
        {tier} {rank}
      </div>

      <div className="text-primary mt-1 text-2xl font-bold">{lp} LP</div>

      {lpDiff != null && (
        <div
          className={[
            "mt-2 text-sm font-bold",
            lpDiff >= 0 ? "text-success" : "text-danger",
          ].join(" ")}
        >
          前回比 {formatLpDiff(lpDiff)}
        </div>
      )}

      <div className="text-muted mt-3 text-sm">
        {wins}勝 {losses}敗 / 勝率 {winRate}%
      </div>
    </div>
  );
}
