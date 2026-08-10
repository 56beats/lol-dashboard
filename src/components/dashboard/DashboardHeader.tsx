import { SyncControls } from "@/components/dashboard/SyncControls";

type Props = {
  activeGame: "lol" | "tft";
  accountId?: string;
  accountName?: string;

  lastLolMatchSync?: Date | null;
  lastLolRankSync?: Date | null;

  lastTftMatchSync?: Date | null;
  lastTftRankSync?: Date | null;
};

export function DashboardHeader({
  activeGame,
  accountId,
  accountName,
  lastLolMatchSync,
  lastLolRankSync,
  lastTftMatchSync,
  lastTftRankSync,
}: Props) {
  const isTft = activeGame === "tft";

  return (
    <header className="border-border bg-surface border-b px-3 py-4 backdrop-blur sm:px-6 sm:py-5">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <div className="text-foreground text-lg font-bold sm:text-xl">
            LOL DASHBOARD
          </div>
          {accountName ? (
            <div className="text-muted text-sm">{accountName}</div>
          ) : null}
        </div>

        <SyncControls
          game={activeGame}
          accountId={accountId}
          lastMatchSync={isTft ? lastTftMatchSync : lastLolMatchSync}
          lastRankSync={isTft ? lastTftRankSync : lastLolRankSync}
        />
      </div>
    </header>
  );
}
