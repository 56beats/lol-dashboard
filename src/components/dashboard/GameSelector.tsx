"use client";

import Link from "next/link";

type Props = {
  activeGame: "lol" | "tft";
};

export function GameSelector({ activeGame }: Props) {
  return (
    <div className="mt-6 flex gap-2">
      <Link
        href="/?game=lol"
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
        href="/?game=tft"
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
