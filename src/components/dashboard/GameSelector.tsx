"use client";

import Link from "next/link";

type Props = {
  activeGame: "lol" | "tft";
  period?: string;
};

export function GameSelector({ activeGame, period = "recent20" }: Props) {
  const buildHref = (game: "lol" | "tft") => {
    const params = new URLSearchParams();
    params.set("game", game);
    if (period) {
      params.set("period", period);
    }
    return `/?${params.toString()}`;
  };

  return (
    <div className="mt-6 flex gap-2">
      <Link
        href={buildHref("lol")}
        className={[
          "rounded-xl px-4 py-2 text-sm font-bold",
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
