import type { TftAugmentStat } from "@/lib/dashboard/tft";

type Props = {
  stats: TftAugmentStat[];
};

export function TftAugmentStats({ stats }: Props) {
  if (stats.length === 0) {
    return (
      <div className="border-border bg-surface rounded-2xl border p-5 shadow-lg backdrop-blur">
        <div className="text-muted mb-3 text-sm">Augment別統計</div>
        <div className="text-muted text-sm">対象期間のデータがありません</div>
      </div>
    );
  }

  return (
    <div className="border-border bg-surface rounded-2xl border p-5 shadow-lg backdrop-blur">
      <div className="text-muted mb-3 text-sm">Augment別統計</div>
      <div className="space-y-3">
        {stats.map((stat) => (
          <div
            key={stat.augmentId}
            className="border-border/60 rounded-xl border p-3"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="text-foreground font-bold break-words">
                {stat.augmentName}
              </div>
              <div className="text-muted text-sm">{stat.games}試合</div>
            </div>
            <div className="text-muted mt-2 flex flex-wrap gap-3 text-sm">
              <span>平均順位 {stat.averagePlacement}</span>
              <span>Top4 {stat.top4Rate}%</span>
              <span>1位 {stat.firstRate}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
