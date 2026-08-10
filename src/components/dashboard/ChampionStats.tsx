import type { ChampionStat } from "@/lib/dashboard/lol";

type Props = {
  stats: ChampionStat[];
};

export function ChampionStats({ stats }: Props) {
  if (stats.length === 0) {
    return (
      <div className="border-border bg-surface rounded-2xl border p-5 shadow-lg backdrop-blur">
        <div className="text-muted mb-3 text-sm">チャンピオン別成績</div>
        <div className="text-muted text-sm">対象期間のデータがありません</div>
      </div>
    );
  }

  return (
    <div className="border-border bg-surface rounded-2xl border p-5 shadow-lg backdrop-blur">
      <div className="text-muted mb-3 text-sm">チャンピオン別成績</div>
      <div className="space-y-3">
        {stats.map((stat) => (
          <div
            key={stat.championId}
            className="border-border/60 rounded-xl border p-3"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="text-foreground font-bold break-words">
                {stat.championName}
              </div>
              <div className="text-muted text-sm">{stat.games}試合</div>
            </div>
            <div className="text-muted mt-2 flex flex-wrap gap-3 text-sm">
              <span>
                {stat.wins}勝 {stat.losses}敗
              </span>
              <span>勝率 {stat.winRate}%</span>
              <span>KDA {stat.avgKda}</span>
            </div>
            <div className="text-muted mt-2 flex flex-wrap gap-3 text-xs">
              <span>平均K {stat.avgKills}</span>
              <span>D {stat.avgDeaths}</span>
              <span>A {stat.avgAssists}</span>
              <span>CS {stat.avgCs}</span>
              <span>DMG {stat.avgDamage}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
