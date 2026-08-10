import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { GameSelector } from "@/components/dashboard/GameSelector";
import { MatchCard } from "@/components/dashboard/MatchCard";
import { RankCard } from "@/components/dashboard/RankCard";
import { RankChart } from "@/components/dashboard/RankChart";
import { StatCard } from "@/components/dashboard/StatCard";
import { TftMatchCard } from "@/components/dashboard/TftMatchCard";
import { ChampionStats } from "@/components/dashboard/ChampionStats";
import { PatchStats } from "@/components/dashboard/PatchStats";
import { RoleStats } from "@/components/dashboard/RoleStats";
import { LolPeriodFilter } from "@/components/dashboard/LolPeriodFilter";
import { prisma } from "@/lib/prisma";
import {
  calculateLolChampionStats,
  calculateLolPatchStats,
  calculateLolRoleStats,
  calculateLolStats,
  getLolMatchesForDisplay,
  getLolPeriodLabel,
  type LolPeriod,
} from "@/lib/dashboard/lol";
import {
  getLolRankChartData,
  getLolRankHistory,
  calculateLolRankLpDiffForPeriod,
} from "@/lib/dashboard/rank";
import {
  getTftMatchesForDisplay,
  calculateTftStats,
  getTftRankChartData,
  getLatestTftRank,
} from "@/lib/dashboard/tft";

type Props = {
  searchParams?: Promise<{
    game?: string;
    period?: string;
  }>;
};

export default async function Home({ searchParams }: Props) {
  const params = await searchParams;
  const activeGame = params?.game === "tft" ? "tft" : "lol";
  const period = (params?.period as LolPeriod | undefined) ?? "recent20";

  const appConfig = await prisma.appConfig.findUnique({
    where: {
      id: "default",
    },
  });
  const myPuuid = appConfig?.puuid;

  const lolMatchesForDisplay = await getLolMatchesForDisplay(myPuuid, period);
  const lolStats = calculateLolStats(lolMatchesForDisplay);
  const championStats = calculateLolChampionStats(lolMatchesForDisplay);
  const roleStats = calculateLolRoleStats(lolMatchesForDisplay);
  const patchStats = calculateLolPatchStats(lolMatchesForDisplay);
  const { latestRank, history } = await getLolRankHistory(period);
  const lpDiff = calculateLolRankLpDiffForPeriod(history);
  const rankChartData = await getLolRankChartData();

  const tftMatchesForDisplay = await getTftMatchesForDisplay();
  const tftStats = calculateTftStats(tftMatchesForDisplay);
  const latestTftRank = await getLatestTftRank();
  const tftRankChartData = await getTftRankChartData();

  return (
    <main className="bg-background text-foreground min-h-screen">
      <DashboardHeader
        activeGame={activeGame}
        lastLolMatchSync={appConfig?.lastMatchSync}
        lastLolRankSync={appConfig?.lastRankSync}
        lastTftMatchSync={appConfig?.lastTftMatchSync}
        lastTftRankSync={appConfig?.lastTftRankSync}
      />

      <div className="mx-auto max-w-6xl px-6 py-10">
        <section className="border-border bg-surface rounded-3xl border p-8 shadow-2xl backdrop-blur">
          <div className="text-muted text-sm">Riot ID</div>
          <h1 className="mt-2 text-4xl font-bold">
            {appConfig
              ? `${appConfig.riotGameName}#${appConfig.riotTagLine}`
              : "Riot ID未同期"}
          </h1>
          <p className="text-muted mt-3 text-sm">
            データはRiot Games APIから取得しています
          </p>
        </section>

        <GameSelector activeGame={activeGame} period={period} />

        {activeGame === "lol" ? (
          <>
            <section className="mt-6 flex flex-wrap items-center justify-between gap-3">
              <div className="text-muted text-sm">
                対象期間: {getLolPeriodLabel(period)}
              </div>
              <LolPeriodFilter activePeriod={period} />
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
                subText={getLolPeriodLabel(period)}
              />
            </section>

            <section className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <div className="border-border bg-surface rounded-2xl border p-5 shadow-lg backdrop-blur">
                <div className="text-muted mb-3 text-sm">期間LP</div>
                <div className="text-foreground text-2xl font-bold">
                  {lpDiff != null
                    ? `${lpDiff >= 0 ? "+" : ""}${lpDiff} LP`
                    : "--"}
                </div>
                {lpDiff != null && (
                  <div
                    className={[
                      "mt-2 text-sm font-bold",
                      lpDiff >= 0 ? "text-success" : "text-danger",
                    ].join(" ")}
                  >
                    {lpDiff >= 0 ? "増加" : "減少"}
                  </div>
                )}
              </div>
              <ChampionStats stats={championStats} />
              <RoleStats stats={roleStats} />
            </section>

            <section className="mt-6 grid gap-4 lg:grid-cols-2">
              <PatchStats stats={patchStats} />
              <div className="border-border bg-surface rounded-2xl border p-5 shadow-lg backdrop-blur">
                <div className="text-muted mb-3 text-sm">分析対象期間</div>
                <div className="text-foreground text-lg font-bold">
                  {getLolPeriodLabel(period)}
                </div>
                <div className="text-muted mt-2 text-sm">
                  勝率・KDA・チャンピオン・ロール・パッチ・LP増減がこの期間で集計されます
                </div>
              </div>
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
