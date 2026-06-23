export function DashboardHeader() {
  return (
    <header className="border-b border-white/10 bg-slate-950/80 px-6 py-5 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between">
        <div className="text-xl font-bold text-white">LOL DASHBOARD</div>

        <div className="flex gap-2">
          <a
            href="/api/sync"
            className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-500"
          >
            試合同期
          </a>

          <a
            href="/api/sync-rank"
            className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-500"
          >
            LP同期
          </a>
          <a
            href="/api/tft-sync"
            className="rounded-xl bg-purple-600 px-4 py-2 text-sm font-bold text-white hover:bg-purple-500"
          >
            TFT試合同期
          </a>
          <a
            href="/api/tft-sync-rank"
            className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-500"
          >
            TFT LP同期
          </a>
        </div>
      </div>
    </header>
  );
}
