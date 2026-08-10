"use client";

import Link from "next/link";

type Props = {
  activeGame: "lol" | "tft";
  period?: string;
  accountId?: string;
};

export function GameSelector({
  activeGame,
  period = "recent20",
  accountId,
}: Props) {
  const buildHref = (game: "lol" | "tft") => {
    const params = new URLSearchParams();
    params.set("game", game);
    if (period) {
      params.set("period", period);
    }
    if (accountId) {
      params.set("account", accountId);
    }
    return `/?${params.toString()}`;
  };

  return (
    <div className="mt-6 grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto">
      <Link
        href={buildHref("lol")}
        className={[
          "flex min-h-11 items-center justify-center rounded-xl px-4 py-2 text-sm font-bold",
          activeGame === "lol"
            ? "bg-primary text-surface"
            : "bg-surface-subtle text-muted hover:bg-primary-light",
        ].join(" ")}
      >
        LoL
      </Link>

      <Link
        href={buildHref("tft")}
        className={[
          "rounded-xl px-4 py-2 text-sm font-bold",
          activeGame === "tft"
            ? "bg-primary text-surface"
            : "bg-surface-subtle text-muted hover:bg-primary-light",
        ].join(" ")}
      >
        TFT
      </Link>
    </div>
  );
}
