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
            ? "bg-blue-600 text-white"
            : "bg-white/10 text-slate-300 hover:bg-white/20",
        ].join(" ")}
      >
        LoL
      </Link>

      <Link
        href="/?game=tft"
        className={[
          "rounded-xl px-4 py-2 text-sm font-bold",
          activeGame === "tft"
            ? "bg-emerald-600 text-white"
            : "bg-white/10 text-slate-300 hover:bg-white/20",
        ].join(" ")}
      >
        TFT
      </Link>
    </div>
  );
}
