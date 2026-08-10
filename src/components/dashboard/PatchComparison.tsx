import type { PatchComparison } from "@/lib/dashboard/lol";

type Props = {
  comparison: PatchComparison;
};

function formatDelta(current: number, previous: number, isLowerBetter = false) {
  const diff = current - previous;
  const sign = diff > 0 ? "+" : diff < 0 ? "" : "";
  const label = `${sign}${diff}`;

  if (isLowerBetter) {
    return diff < 0
      ? `+${Math.abs(diff)}`
      : diff > 0
        ? `-${Math.abs(diff)}`
        : "±0";
  }

  return label;
}

function getDiffColor(
  current: number,
  previous: number,
  isLowerBetter = false
) {
  if (current === previous) {
    return "text-foreground";
  }

  if (isLowerBetter) {
    return current < previous ? "text-success" : "text-danger";
  }

  return current > previous ? "text-success" : "text-danger";
}

export function PatchComparison({ comparison }: Props) {
  if (comparison.message || !comparison.latest || !comparison.previous) {
    return (
      <div className="border-border bg-surface rounded-2xl border p-5 shadow-lg backdrop-blur">
        <div className="text-muted mb-3 text-sm">パッチ比較</div>
        <div className="text-muted text-sm">
          {comparison.message ?? "比較できる前パッチのデータがありません"}
        </div>
      </div>
    );
  }

  return (
    <div className="border-border bg-surface rounded-2xl border p-5 shadow-lg backdrop-blur">
      <div className="text-muted mb-3 text-sm">パッチ比較</div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="border-border/60 rounded-xl border p-3">
          <div className="text-foreground font-bold">
            {comparison.latest.patch}
          </div>
          <div className="text-muted mt-2 text-sm">
            試合数 {comparison.latest.games}
          </div>
          <div className="text-muted mt-2 text-sm">
            勝率 {comparison.latest.winRate}%
          </div>
          <div className="text-muted mt-2 text-sm">
            平均KDA {comparison.latest.avgKda}
          </div>
          <div className="text-muted mt-2 text-sm">
            平均CS {comparison.latest.avgCs}
          </div>
          <div className="text-muted mt-2 text-sm">
            平均ダメージ {comparison.latest.avgDamage}
          </div>
        </div>
        <div className="border-border/60 rounded-xl border p-3">
          <div className="text-foreground font-bold">
            {comparison.previous.patch}
          </div>
          <div className="text-muted mt-2 text-sm">
            試合数 {comparison.previous.games}
          </div>
          <div className="text-muted mt-2 text-sm">
            勝率 {comparison.previous.winRate}%
          </div>
          <div className="text-muted mt-2 text-sm">
            平均KDA {comparison.previous.avgKda}
          </div>
          <div className="text-muted mt-2 text-sm">
            平均CS {comparison.previous.avgCs}
          </div>
          <div className="text-muted mt-2 text-sm">
            平均ダメージ {comparison.previous.avgDamage}
          </div>
        </div>
      </div>
      <div className="mt-4 space-y-2 text-sm">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-muted">勝率</span>
          <span
            className={[
              "font-bold",
              getDiffColor(
                comparison.latest.winRate,
                comparison.previous.winRate
              ),
            ].join(" ")}
          >
            {comparison.latest.winRate}% / {comparison.previous.winRate}% (
            {formatDelta(
              comparison.latest.winRate,
              comparison.previous.winRate
            )}
            pt)
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted">平均KDA</span>
          <span
            className={[
              "font-bold",
              getDiffColor(
                Number(comparison.latest.avgKda),
                Number(comparison.previous.avgKda)
              ),
            ].join(" ")}
          >
            {comparison.latest.avgKda} / {comparison.previous.avgKda} (
            {formatDelta(
              Number(comparison.latest.avgKda),
              Number(comparison.previous.avgKda)
            )}
            )
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted">平均CS</span>
          <span
            className={[
              "font-bold",
              getDiffColor(comparison.latest.avgCs, comparison.previous.avgCs),
            ].join(" ")}
          >
            {comparison.latest.avgCs} / {comparison.previous.avgCs} (
            {formatDelta(comparison.latest.avgCs, comparison.previous.avgCs)})
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted">平均ダメージ</span>
          <span
            className={[
              "font-bold",
              getDiffColor(
                comparison.latest.avgDamage,
                comparison.previous.avgDamage
              ),
            ].join(" ")}
          >
            {comparison.latest.avgDamage} / {comparison.previous.avgDamage} (
            {formatDelta(
              comparison.latest.avgDamage,
              comparison.previous.avgDamage
            )}
            )
          </span>
        </div>
      </div>
    </div>
  );
}
