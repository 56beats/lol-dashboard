import type { TftPatchComparison } from "@/lib/dashboard/tft";

type Props = {
  comparison: TftPatchComparison;
};

export function TftPatchComparison({ comparison }: Props) {
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
            平均順位 {comparison.latest.averagePlacement}
          </div>
          <div className="text-muted mt-2 text-sm">
            Top4 {comparison.latest.top4Rate}%
          </div>
          <div className="text-muted mt-2 text-sm">
            1位 {comparison.latest.firstRate}%
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
            平均順位 {comparison.previous.averagePlacement}
          </div>
          <div className="text-muted mt-2 text-sm">
            Top4 {comparison.previous.top4Rate}%
          </div>
          <div className="text-muted mt-2 text-sm">
            1位 {comparison.previous.firstRate}%
          </div>
        </div>
      </div>
    </div>
  );
}
