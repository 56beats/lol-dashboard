import type { TftUnitStat } from "@/lib/dashboard/tft";

type Props = {
  stats: TftUnitStat[];
};

export function TftUnitStats({ stats }: Props) {
  if (stats.length === 0) {
    return (
      <div className="border-border bg-surface rounded-2xl border p-5 shadow-lg backdrop-blur">
        <div className="text-muted mb-3 text-sm">Unit別統計</div>
        <div className="text-muted text-sm">対象期間のデータがありません</div>
      </div>
    );
  }

  return (
    <div className="border-border bg-surface rounded-2xl border p-5 shadow-lg backdrop-blur">
      <div className="text-muted mb-3 text-sm">Unit別統計</div>
      <div className="space-y-3">
        {stats.map((stat) => (
          <div key={stat.unitId} className="rounded-xl border border-border/60 p-3">
            <div className="flex items-center justify-between gap-2">
              <div className="text-foreground font-bold">{stat.unitName}</div>
              <div className="text-muted text-sm">{stat.games}試合</div>
            </div>
            <div className="mt-2 flex flex-wrap gap-3 text-sm text-muted">
              <span>平均順位 {stat.averagePlacement}</span>
              <span>Top4 {stat.top4Rate}%</span>
              <span>平均★ {stat.averageTier}</span>
              <span>★3 {stat.threeStarRate}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
