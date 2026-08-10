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
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-border/60 p-3">
          <div className="text-foreground font-bold">{comparison.latest.patch}</div>
          <div className="mt-2 text-sm text-muted">試合数 {comparison.latest.games}</div>
          <div className="mt-2 text-sm text-muted">平均順位 {comparison.latest.averagePlacement}</div>
          <div className="mt-2 text-sm text-muted">Top4 {comparison.latest.top4Rate}%</div>
          <div className="mt-2 text-sm text-muted">1位 {comparison.latest.firstRate}%</div>
        </div>
        <div className="rounded-xl border border-border/60 p-3">
          <div className="text-foreground font-bold">{comparison.previous.patch}</div>
          <div className="mt-2 text-sm text-muted">試合数 {comparison.previous.games}</div>
          <div className="mt-2 text-sm text-muted">平均順位 {comparison.previous.averagePlacement}</div>
          <div className="mt-2 text-sm text-muted">Top4 {comparison.previous.top4Rate}%</div>
          <div className="mt-2 text-sm text-muted">1位 {comparison.previous.firstRate}%</div>
        </div>
      </div>
    </div>
  );
}
