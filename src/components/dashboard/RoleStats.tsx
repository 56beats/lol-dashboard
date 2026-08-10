import type { RoleStat } from "@/lib/dashboard/lol";

type Props = {
  stats: RoleStat[];
};

const roleLabels: Record<string, string> = {
  TOP: "TOP",
  JUNGLE: "JG",
  MIDDLE: "MID",
  BOTTOM: "ADC",
  UTILITY: "SUP",
};

export function RoleStats({ stats }: Props) {
  if (stats.length === 0) {
    return (
      <div className="border-border bg-surface rounded-2xl border p-5 shadow-lg backdrop-blur">
        <div className="text-muted mb-3 text-sm">ロール別成績</div>
        <div className="text-muted text-sm">対象期間のデータがありません</div>
      </div>
    );
  }

  return (
    <div className="border-border bg-surface rounded-2xl border p-5 shadow-lg backdrop-blur">
      <div className="text-muted mb-3 text-sm">ロール別成績</div>
      <div className="space-y-3">
        {stats.map((stat) => (
          <div
            key={stat.role}
            className="border-border/60 rounded-xl border p-3"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="text-foreground font-bold">
                {roleLabels[stat.role] ?? stat.role}
              </div>
              <div className="text-muted text-sm">{stat.games}試合</div>
            </div>
            <div className="text-muted mt-2 flex flex-wrap gap-3 text-sm">
              <span>勝率 {stat.winRate}%</span>
              <span>KDA {stat.avgKda}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
