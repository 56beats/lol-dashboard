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
    <header className="border-border bg-surface border-b px-3 py-4 backdrop-blur sm:px-6 sm:py-5">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-foreground text-lg font-bold sm:text-xl">
          LOL DASHBOARD
        </div>

        <SyncControls
          game={activeGame}
          lastMatchSync={isTft ? lastTftMatchSync : lastLolMatchSync}
          lastRankSync={isTft ? lastTftRankSync : lastLolRankSync}
        />
      </div>
    </header>
  );
}
