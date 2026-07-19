import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { GameSelector } from "@/components/dashboard/GameSelector";
import { MatchCard } from "@/components/dashboard/MatchCard";
import { RankCard } from "@/components/dashboard/RankCard";
import { RankChart } from "@/components/dashboard/RankChart";
import { StatCard } from "@/components/dashboard/StatCard";
import { TftMatchCard } from "@/components/dashboard/TftMatchCard";
import { prisma } from "@/lib/prisma";
import {
  getLolMatchesForDisplay,
  calculateLolStats,
} from "@/lib/dashboard/lol";
import { getLolRankChartData, getLolRankHistory, calculateLolRankLpDiff } from "@/lib/dashboard/rank";
import {
  getTftMatchesForDisplay,
  calculateTftStats,
  getTftRankChartData,
  getLatestTftRank,
} from "@/lib/dashboard/tft";

type Props = {
  searchParams?: Promise<{
    game?: string;
  }>;
};

export default async function Home({ searchParams }: Props) {
  const params = await searchParams;
  const activeGame = params?.game === "tft" ? "tft" : "lol";

  // 現在のアカウント情報を取得
  const appConfig = await prisma.appConfig.findUnique({
    where: {
      id: "default",
    },
  });
  const myPuuid = appConfig?.puuid;

  // === LoL データ取得・変換 ===
  const lolMatchesForDisplay = await getLolMatchesForDisplay(myPuuid);
  const lolStats = calculateLolStats(lolMatchesForDisplay);
  const { latestRank, previousRank } = await getLolRankHistory();
  const lpDiff = calculateLolRankLpDiff(latestRank, previousRank);
  const rankChartData = await getLolRankChartData();

  // === TFT データ取得・変換 ===
  const tftMatchesForDisplay = await getTftMatchesForDisplay();
  const tftStats = calculateTftStats(tftMatchesForDisplay);
  const latestTftRank = await getLatestTftRank();
  const tftRankChartData = await getTftRankChartData();

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#1e3a8a_0,#020617_45%,#020617_100%)] text-white">
      <DashboardHeader />

      <div className="mx-auto max-w-6xl px-6 py-10">
        <section className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur">
          <div className="text-sm text-slate-400">Riot ID</div>
          <h1 className="mt-2 text-4xl font-bold">
            {appConfig
              ? `${appConfig.riotGameName}#${appConfig.riotTagLine}`
              : "Riot ID未同期"}
          </h1>
          <p className="mt-3 text-sm text-slate-400">
            データはRiot Games APIから取得しています
          </p>
        </section>

        <GameSelector activeGame={activeGame} />

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
                value={`${lolStats.winRate}%`}
                subText={`${lolStats.wins}勝 ${lolStats.losses}敗`}
              />

              <StatCard
                label="平均KDA"
                value={lolStats.avgKda}
                subText={`${lolStats.totalKills} / ${lolStats.totalDeaths} / ${lolStats.totalAssists}`}
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
                    participants={match.participants}
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
                value={tftStats.averagePlacement}
                subText="最近20試合"
              />

              <StatCard
                label="Top4率"
                value={`${tftStats.top4Rate}%`}
                subText={`${tftStats.top4Count} / ${tftMatchesForDisplay.length}`}
              />

              <StatCard
                label="試合数"
                value={tftMatchesForDisplay.length}
                subText="最近20試合"
              />
            </section>

            <section className="mt-6">
              <RankChart data={tftRankChartData} />
            </section>

            <section className="mt-10">
              <h2 className="text-2xl font-bold">最近のTFT試合</h2>

              <div className="mt-4 space-y-3">
                {tftMatchesForDisplay.map((match) => (
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
