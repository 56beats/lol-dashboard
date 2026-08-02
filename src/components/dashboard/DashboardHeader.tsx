import { SyncControls } from "@/components/dashboard/SyncControls";

type Props = {
  activeGame: "lol" | "tft";

  lastLolMatchSync?: Date | null;
  lastLolRankSync?: Date | null;

  lastTftMatchSync?: Date | null;
  lastTftRankSync?: Date | null;
};

export function DashboardHeader({
  activeGame,
  lastLolMatchSync,
  lastLolRankSync,
  lastTftMatchSync,
  lastTftRankSync,
}: Props) {
  const isTft = activeGame === "tft";

  return (
    <header className="border-b border-white/10 bg-slate-950/80 px-6 py-5 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-xl font-bold text-white">LOL DASHBOARD</div>

        <SyncControls
          game={activeGame}
          lastMatchSync={isTft ? lastTftMatchSync : lastLolMatchSync}
          lastRankSync={isTft ? lastTftRankSync : lastLolRankSync}
        />
      </div>
    </header>
  );
}
