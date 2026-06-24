import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { MatchCard } from "@/components/dashboard/MatchCard";
import { RankCard } from "@/components/dashboard/RankCard";
import { RankChart } from "@/components/dashboard/RankChart";
import { StatCard } from "@/components/dashboard/StatCard";
import { TftMatchCard } from "@/components/dashboard/TftMatchCard";
import { resolveDdragonVersion } from "@/lib/ddragon";
import { prisma } from "@/lib/prisma";
import { calculateRankScore, formatShortRankWithLp } from "@/lib/rank";
import { getTftDisplayMaps } from "@/lib/tft/ddragon";
import type { TftTrait, TftUnit } from "@/types/tft";

type Props = {
  searchParams?: Promise<{
    game?: string;
  }>;
};

export default async function Home({ searchParams }: Props) {
  const params = await searchParams;
  const activeGame = params?.game === "tft" ? "tft" : "lol";

  const myPuuid = process.env.RIOT_PUUID;

  /**
   * 新しいLoL試合保存構造から最近20試合を取得する
   *
   * LolMatch:
   *   試合全体の情報
   *
   * LolParticipant:
   *   10人分の参加者情報
   *
   * ここではまず、自分の参加者情報だけを取得して
   * 既存のMatchCardで表示できる形へ変換する。
   */
  const lolMatches = await prisma.lolMatch.findMany({
    orderBy: {
      playedAt: "desc",
    },
    take: 20,
    include: {
      participants: {
        where: {
          puuid: myPuuid,
        },
      },
    },
  });

  /**
   * LoLチャンピオン情報をDBから取得する
   *
   * championIdはRiot API上では数値key。
   * 例:
   *   Senna -> 235
   */
  const lolChampions = await prisma.lolChampion.findMany();

  const lolChampionMap = new Map(
    lolChampions.map((champion) => [champion.key, champion])
  );

  /**
   * LolMatch + 自分のLolParticipant を
   * 既存のMatchCardが扱える形に変換する
   */
  const lolMatchesForDisplay = await Promise.all(
    lolMatches.map(async (match) => {
      const me = match.participants[0];

      if (!me) {
        return null;
      }

      const champion = lolChampionMap.get(me.championId);

      return {
        id: match.matchId,
        champion: me.championName,
        championJa: champion?.nameJa ?? me.championName,
        win: me.win,
        kills: me.kills,
        deaths: me.deaths,
        assists: me.assists,
        gameMode: match.gameMode,
        queueId: match.queueId,
        playedAt: match.playedAt,
        itemIds: [
          me.item0 ?? 0,
          me.item1 ?? 0,
          me.item2 ?? 0,
          me.item3 ?? 0,
          me.item4 ?? 0,
          me.item5 ?? 0,
          me.item6 ?? 0,
        ],
        ddragonVersion: await resolveDdragonVersion(match.gameVersion),
      };
    })
  ).then((matches) =>
    matches.filter(
      (match): match is NonNullable<typeof match> => match !== null
    )
  );

  const rankHistory = await prisma.rankSnapshot.findMany({
    orderBy: {
      createdAt: "asc",
    },
    take: 30,
  });

  const latestRank = rankHistory.at(-1);
  const previousRank = rankHistory.at(-2);

  // TFTランク履歴を古い順で取得する
  // RankChartで推移グラフとして使う
  const tftRankHistory = await prisma.tftRankSnapshot.findMany({
    orderBy: {
      createdAt: "asc",
    },
    take: 30,
  });

  // 最新TFTランクは履歴の最後を使う
  const latestTftRank = tftRankHistory.at(-1);
  const tftMatches = await prisma.tftMatch.findMany({
    orderBy: {
      playedAt: "desc",
    },
    take: 20,
  });

  // DBに同期済みのCommunityDragon画像付きTFTチャンピオン一覧を取得する
  const tftChampions = await prisma.tftChampion.findMany();

  // TFTユニットIDからチャンピオン情報をすぐ取得できるようにMap化する
  // 例: TFT17_Aatrox -> { name, imageUrl, ... }
  const tftChampionMap = new Map(
    tftChampions.map((champion) => [champion.id, champion])
  );

  const tftDisplayMaps = await getTftDisplayMaps();

  const tftMatchesWithDisplay = tftMatches.map((match) => ({
    ...match,

    augments: (match.augments as string[]).map(
      (id) => tftDisplayMaps.augments[id] ?? { id, name: id }
    ),

    traits: (match.traits as TftTrait[])
      .map((trait) => ({
        ...trait,
        name: tftDisplayMaps.traits[trait.id]?.name ?? trait.id,
        imageUrl: tftDisplayMaps.traits[trait.id]?.imageUrl,
      }))
      .sort((a, b) => {
        const aStyle = a.style ?? 0;
        const bStyle = b.style ?? 0;
        // まずティア順
        if (aStyle !== bStyle) {
          return bStyle - aStyle;
        }

        // 同じティアなら発動数順
        return b.numUnits - a.numUnits;
      }),

    /**
     * TFTユニット情報を画面表示用へ変換する
     *
     * DBには
     * TFT17_Kindred
     * TFT_Item_GuinsoosRageblade
     *
     * のようなIDしか保存していないため、
     * Data Dragonを使って
     * 日本語名・画像URLへ変換する。
     */
    units: (match.units as TftUnit[]).map((unit) => ({
      ...unit,

      // DBに保存したCommunityDragon画像付きチャンピオン情報を取得する
      // なければData Dragon側の表示情報にフォールバックする
      name:
        tftChampionMap.get(unit.id)?.name ??
        tftDisplayMaps.champions[unit.id]?.name ??
        unit.id,

      // チャンピオン画像はDBに保存したCommunityDragon画像を優先する
      imageUrl:
        tftChampionMap.get(unit.id)?.imageUrl ??
        tftDisplayMaps.champions[unit.id]?.imageUrl,

      items: unit.itemIds.map((itemId) => ({
        ...(tftDisplayMaps.items[itemId] ?? {
          id: itemId,
          name: itemId,
        }),
      })),
    })),
  }));

  const averagePlacement =
    tftMatches.length > 0
      ? (
          tftMatches.reduce((sum, match) => sum + match.placement, 0) /
          tftMatches.length
        ).toFixed(2)
      : "-";

  const top4Count = tftMatches.filter((match) => match.placement <= 4).length;

  const top4Rate =
    tftMatches.length > 0
      ? Math.round((top4Count / tftMatches.length) * 100)
      : 0;

  /**
   * 現在ランクと前回ランクの差分を計算する
   */
  const lpDiff =
    latestRank && previousRank
      ? calculateRankScore(latestRank.tier, latestRank.rank, latestRank.lp) -
        calculateRankScore(
          previousRank.tier,
          previousRank.rank,
          previousRank.lp
        )
      : undefined;

  /**
   * LoLランク履歴をグラフ表示用の形に変換する
   */
  const rankChartData = rankHistory.map((rank) => ({
    date: rank.createdAt.toLocaleDateString("ja-JP", {
      month: "numeric",
      day: "numeric",
    }),
    score: calculateRankScore(rank.tier, rank.rank, rank.lp),
    label: formatShortRankWithLp(rank.tier, rank.rank, rank.lp),
  }));

  /**
   * TFTランク履歴をグラフ表示用の形に変換する
   */
  const tftRankChartData = tftRankHistory.map((rank) => ({
    date: rank.createdAt.toLocaleDateString("ja-JP", {
      month: "numeric",
      day: "numeric",
    }),
    score: calculateRankScore(rank.tier, rank.rank, rank.lp),
    label: formatShortRankWithLp(rank.tier, rank.rank, rank.lp),
  }));

  const wins = lolMatchesForDisplay.filter((m) => m.win).length;
  const losses = lolMatchesForDisplay.length - wins;
  const winRate =
    lolMatchesForDisplay.length > 0
      ? Math.round((wins / lolMatchesForDisplay.length) * 100)
      : 0;

  const totalKills = lolMatchesForDisplay.reduce((sum, m) => sum + m.kills, 0);
  const totalDeaths = lolMatchesForDisplay.reduce(
    (sum, m) => sum + m.deaths,
    0
  );
  const totalAssists = lolMatchesForDisplay.reduce(
    (sum, m) => sum + m.assists,
    0
  );

  const avgKda =
    totalDeaths === 0
      ? "Perfect"
      : ((totalKills + totalAssists) / totalDeaths).toFixed(2);

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#1e3a8a_0,#020617_45%,#020617_100%)] text-white">
      <DashboardHeader />

      <div className="mx-auto max-w-6xl px-6 py-10">
        <section className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur">
          <div className="text-sm text-slate-400">Riot ID</div>
          <h1 className="mt-2 text-4xl font-bold">56beats#3460</h1>
          <p className="mt-3 text-sm text-slate-400">
            データはRiot Games APIから取得しています
          </p>
        </section>

        <div className="mt-6 flex gap-2">
          <a
            href="/?game=lol"
            className={[
              "rounded-xl px-4 py-2 text-sm font-bold",
              activeGame === "lol"
                ? "bg-blue-600 text-white"
                : "bg-white/10 text-slate-300 hover:bg-white/20",
            ].join(" ")}
          >
            LoL
          </a>

          <a
            href="/?game=tft"
            className={[
              "rounded-xl px-4 py-2 text-sm font-bold",
              activeGame === "tft"
                ? "bg-emerald-600 text-white"
                : "bg-white/10 text-slate-300 hover:bg-white/20",
            ].join(" ")}
          >
            TFT
          </a>
        </div>

        {activeGame === "lol" ? (
          <>
            <section className="mt-6 grid gap-4 md:grid-cols-4">
              <RankCard
                tier={latestRank?.tier}
                rank={latestRank?.rank}
                lp={latestRank?.lp}
                wins={latestRank?.wins}
                losses={latestRank?.losses}
                lpDiff={lpDiff}
              />

              <StatCard
                label="勝率"
                value={`${winRate}%`}
                subText={`${wins}勝 ${losses}敗`}
              />

              <StatCard
                label="平均KDA"
                value={avgKda}
                subText={`${totalKills} / ${totalDeaths} / ${totalAssists}`}
              />

              <StatCard
                label="試合数"
                value={lolMatchesForDisplay.length}
                subText="最近20試合"
              />
            </section>

            <section className="mt-6">
              <RankChart data={rankChartData} />
            </section>

            <section className="mt-10">
              <h2 className="text-2xl font-bold">最近の試合</h2>

              <div className="mt-4 space-y-3">
                {lolMatchesForDisplay.map((match) => (
                  <MatchCard
                    key={match.id}
                    champion={match.champion}
                    championJa={match.championJa}
                    win={match.win}
                    kills={match.kills}
                    deaths={match.deaths}
                    assists={match.assists}
                    gameMode={match.gameMode}
                    queueId={match.queueId}
                    playedAt={match.playedAt}
                    itemIds={match.itemIds}
                    ddragonVersion={match.ddragonVersion}
                  />
                ))}
              </div>
            </section>
          </>
        ) : (
          <>
            <section className="mt-6 grid gap-4 md:grid-cols-4">
              <RankCard
                tier={latestTftRank?.tier}
                rank={latestTftRank?.rank}
                lp={latestTftRank?.lp}
                wins={latestTftRank?.wins}
                losses={latestTftRank?.losses}
              />

              <StatCard
                label="平均順位"
                value={averagePlacement}
                subText="最近20試合"
              />

              <StatCard
                label="Top4率"
                value={`${top4Rate}%`}
                subText={`${top4Count} / ${tftMatches.length}`}
              />

              <StatCard
                label="試合数"
                value={tftMatches.length}
                subText="最近20試合"
              />
            </section>

            <section className="mt-6">
              <RankChart data={tftRankChartData} />
            </section>

            <section className="mt-10">
              <h2 className="text-2xl font-bold">最近のTFT試合</h2>

              <div className="mt-4 space-y-3">
                {tftMatchesWithDisplay.map((match) => (
                  <TftMatchCard
                    key={match.id}
                    placement={match.placement}
                    level={match.level}
                    augments={match.augments}
                    traits={match.traits}
                    units={match.units}
                    playedAt={match.playedAt}
                  />
                ))}
              </div>
            </section>
          </>
        )}
      </div>
    </main>
  );
}
