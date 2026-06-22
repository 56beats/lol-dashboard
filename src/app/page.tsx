import { prisma } from "@/lib/prisma";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { MatchCard } from "@/components/dashboard/MatchCard";
import { StatCard } from "@/components/dashboard/StatCard";
import { RankCard } from "@/components/dashboard/RankCard";
import { RankChart } from "@/components/dashboard/RankChart";
import { calculateRankScore } from "@/lib/rank";
import { resolveDdragonVersion, getJapaneseChampionMap } from "@/lib/ddragon";
import { formatShortRankWithLp } from "@/lib/rank";

export default async function Home() {
  const matches = await prisma.match.findMany({
    orderBy: { playedAt: "desc" },
    take: 20,
  });

  const championMap = await getJapaneseChampionMap();
  const matchesWithVersion = await Promise.all(
    matches.map(async (match) => ({
      ...match,
      ddragonVersion: await resolveDdragonVersion(match.gameVersion),
    }))
  );
  const latestRank = await prisma.rankSnapshot.findFirst({
    orderBy: {
      createdAt: "desc",
    },
  });
  const rankHistory = await prisma.rankSnapshot.findMany({
    orderBy: {
      createdAt: "asc",
    },
    take: 30,
  });

  const previousRank = rankHistory.at(-2);

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
   * グラフ表示用データ
   */
  const rankChartData = rankHistory.map((rank) => ({
    date: rank.createdAt.toLocaleDateString("ja-JP", {
      month: "numeric",
      day: "numeric",
    }),
    score: calculateRankScore(rank.tier, rank.rank, rank.lp),
    label: formatShortRankWithLp(rank.tier, rank.rank, rank.lp),
  }));

  const wins = matches.filter((m) => m.win).length;
  const losses = matches.length - wins;
  const winRate =
    matches.length > 0 ? Math.round((wins / matches.length) * 100) : 0;

  const totalKills = matches.reduce((sum, m) => sum + m.kills, 0);
  const totalDeaths = matches.reduce((sum, m) => sum + m.deaths, 0);
  const totalAssists = matches.reduce((sum, m) => sum + m.assists, 0);

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
            value={matches.length}
            subText="最近20試合"
          />
        </section>

        <section className="mt-6">
          <RankChart data={rankChartData} />
        </section>

        <section className="mt-10">
          <h2 className="text-2xl font-bold">最近の試合</h2>

          <div className="mt-4 space-y-3">
            {matchesWithVersion.map((match) => (
              <MatchCard
                key={match.id}
                champion={match.champion}
                championJa={championMap[match.champion]}
                win={match.win}
                kills={match.kills}
                deaths={match.deaths}
                assists={match.assists}
                gameMode={match.gameMode}
                queueId={match.queueId}
                playedAt={match.playedAt}
                itemIds={[
                  match.item0 ?? 0,
                  match.item1 ?? 0,
                  match.item2 ?? 0,
                  match.item3 ?? 0,
                  match.item4 ?? 0,
                  match.item5 ?? 0,
                  match.item6 ?? 0,
                ]}
                ddragonVersion={match.ddragonVersion}
              />
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
