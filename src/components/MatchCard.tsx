import Image from "next/image";
import { calcKda, getChampionImageUrl } from "@/src/lib/champion";

type Props = {
  champion: string;
  win: boolean;
  kills: number;
  deaths: number;
  assists: number;
  gameMode: string;
  playedAt: Date;
};

export function MatchCard({
  champion,
  win,
  kills,
  deaths,
  assists,
  gameMode,
  playedAt,
}: Props) {
  const kda = calcKda(kills, deaths, assists);

  return (
    <div
      className={[
        "rounded-2xl border bg-white/5 p-4 shadow-lg backdrop-blur",
        win ? "border-blue-400/30" : "border-rose-400/30",
      ].join(" ")}
    >
      <div className="flex items-center gap-4">
        <div className="w-16 text-sm font-bold">
          <div className={win ? "text-sky-400" : "text-rose-400"}>
            {win ? "勝利" : "敗北"}
          </div>
          <div className="mt-1 text-xs text-slate-500">
            {playedAt.toLocaleDateString("ja-JP")}
          </div>
        </div>

        <Image
          src={getChampionImageUrl(champion)}
          alt={champion}
          width={56}
          height={56}
          className="rounded-full border border-white/20"
        />

        <div className="min-w-28 flex-1">
          <div className="font-bold text-white">{champion}</div>
          <div className="text-xs text-slate-400">{gameMode}</div>
        </div>

        <div className="text-right">
          <div className="text-lg font-bold text-white">
            {kills} / <span className="text-rose-300">{deaths}</span> /{" "}
            {assists}
          </div>
          <div
            className={win ? "text-sm text-sky-400" : "text-sm text-rose-400"}
          >
            {kda} KDA
          </div>
        </div>
      </div>
    </div>
  );
}
