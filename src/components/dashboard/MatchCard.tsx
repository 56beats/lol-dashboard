import Image from "next/image";
import { getChampionImageUrl, getItemImageUrl } from "@/lib/ddragon";
import { calcKda, filterItemIds, formatQueueType } from "@/lib/match";

type Props = {
  champion: string;
  championJa?: string;
  win: boolean;
  kills: number;
  deaths: number;
  assists: number;
  gameMode: string;
  queueId?: number | null;
  playedAt: Date;

  // Data Dragonに存在する解決済みバージョン
  // 例: "15.24.1"
  ddragonVersion: string;

  // item0〜item6を配列にして渡す
  itemIds: number[];
};

/**
 * 1試合分の戦績カード
 *
 * チャンピオン画像・アイテム画像は、
 * その試合のgameVersionから解決したData Dragonバージョンを使う。
 */
export function MatchCard({
  champion,
  championJa,
  win,
  kills,
  deaths,
  assists,
  gameMode,
  queueId,
  playedAt,
  ddragonVersion,
  itemIds,
}: Props) {
  const kda = calcKda(kills, deaths, assists);
  const displayItems = filterItemIds(itemIds);
  const queueLabel = formatQueueType(queueId, gameMode);

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
          src={getChampionImageUrl(champion, ddragonVersion)}
          alt={championJa ?? champion}
          width={56}
          height={56}
          className="rounded-full border border-white/20"
        />

        <div className="min-w-32 flex-1">
          <div className="font-bold text-white">{championJa ?? champion}</div>
          <div className="text-xs text-slate-400">{queueLabel}</div>

          <div className="mt-2 flex gap-1">
            {displayItems.map((itemId, index) => (
              <Image
                key={`${itemId}-${index}`}
                src={getItemImageUrl(itemId, ddragonVersion)}
                alt={`item-${itemId}`}
                width={28}
                height={28}
                className="rounded-md border border-white/10"
              />
            ))}
          </div>
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
