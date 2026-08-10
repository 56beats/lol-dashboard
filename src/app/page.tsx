import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { GameSelector } from "@/components/dashboard/GameSelector";
import { MatchCard } from "@/components/dashboard/MatchCard";
import { RankCard } from "@/components/dashboard/RankCard";
import { RankChart } from "@/components/dashboard/RankChart";
import { StatCard } from "@/components/dashboard/StatCard";
import { TftMatchCard } from "@/components/dashboard/TftMatchCard";
import { ChampionStats } from "@/components/dashboard/ChampionStats";
import { PatchStats } from "@/components/dashboard/PatchStats";
import { PatchComparison } from "@/components/dashboard/PatchComparison";
import { RoleStats } from "@/components/dashboard/RoleStats";
import { LolPeriodFilter } from "@/components/dashboard/LolPeriodFilter";
import { TftTraitStats } from "@/components/dashboard/TftTraitStats";
import { TftUnitStats } from "@/components/dashboard/TftUnitStats";
import { TftAugmentStats } from "@/components/dashboard/TftAugmentStats";
import { TftPatchStats } from "@/components/dashboard/TftPatchStats";
import { TftPatchComparison } from "@/components/dashboard/TftPatchComparison";
import { prisma } from "@/lib/prisma";
import {
  calculateLolChampionStats,
  calculateLolPatchComparison,
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
  calculateTftTraitStats,
  calculateTftUnitStats,
  calculateTftAugmentStats,
  calculateTftPatchStats,
  calculateTftPatchComparison,
  getTftPeriodLabel,
  getTftRankChartData,
  getLatestTftRank,
} from "@/lib/dashboard/tft";

type Props = {
  searchParams?: Promise<{
    game?: string;
    period?: string;
    account?: string;
    accountId?: string;
  }>;
};

export default async function Home({ searchParams }: Props) {
  const params = await searchParams;
  const activeGame = params?.game === "tft" ? "tft" : "lol";
  const period = (params?.period as LolPeriod | undefined) ?? "recent20";
  const accountId = params?.account ?? params?.accountId;

  const appConfig = await prisma.appConfig.findUnique({
    where: {
      id: "default",
    },
  });
  const riotAccounts = await prisma.riotAccount.findMany({
    orderBy: {
      createdAt: "asc",
    },
  });
  const selectedAccount = accountId
    ? await prisma.riotAccount.findUnique({
        where: {
          id: accountId,
        },
      })
    : await prisma.riotAccount.findFirst({
        where: {
          isPrimary: true,
        },
        orderBy: {
          createdAt: "asc",
        },
      });
  const myPuuid = selectedAccount?.puuid ?? appConfig?.puuid;

  const lolMatchesForDisplay = await getLolMatchesForDisplay(myPuuid, period);
  const lolStats = calculateLolStats(lolMatchesForDisplay);
  const championStats = calculateLolChampionStats(lolMatchesForDisplay);
  const roleStats = calculateLolRoleStats(lolMatchesForDisplay);
  const patchStats = calculateLolPatchStats(lolMatchesForDisplay);
  const patchComparison = calculateLolPatchComparison(lolMatchesForDisplay);
  const { latestRank, history } = await getLolRankHistory(
    period,
    selectedAccount?.id
  );
  const lpDiff = calculateLolRankLpDiffForPeriod(history);
  const rankChartData = await getLolRankChartData(selectedAccount?.id);

  const tftMatchesForDisplay = await getTftMatchesForDisplay(
    period,
    selectedAccount?.id
  );
  const tftStats = calculateTftStats(tftMatchesForDisplay);
  const tftTraitStats = calculateTftTraitStats(tftMatchesForDisplay);
  const tftUnitStats = calculateTftUnitStats(tftMatchesForDisplay);
  const tftAugmentStats = calculateTftAugmentStats(tftMatchesForDisplay);
  const tftPatchStats = calculateTftPatchStats(tftMatchesForDisplay);
  const tftPatchComparison = calculateTftPatchComparison(tftMatchesForDisplay);
  const latestTftRank = await getLatestTftRank(selectedAccount?.id);
  const tftRankChartData = await getTftRankChartData(selectedAccount?.id);

  return (
    <main className="bg-background text-foreground min-h-screen">
      <DashboardHeader
        activeGame={activeGame}
        accountId={selectedAccount?.id}
        accountName={
          selectedAccount?.gameName
            ? `${selectedAccount.gameName}#${selectedAccount.tagLine ?? ""}`
            : undefined
        }
        lastLolMatchSync={
          selectedAccount?.lastMatchSync ?? appConfig?.lastMatchSync
        }
        lastLolRankSync={
          selectedAccount?.lastRankSync ?? appConfig?.lastRankSync
        }
        lastTftMatchSync={
          selectedAccount?.lastTftMatchSync ?? appConfig?.lastTftMatchSync
        }
        lastTftRankSync={
          selectedAccount?.lastTftRankSync ?? appConfig?.lastTftRankSync
        }
      />

      <div className="mx-auto max-w-6xl px-3 py-5 sm:px-4 md:px-6 md:py-10">
        <section className="border-border bg-surface rounded-3xl border p-4 shadow-2xl backdrop-blur md:p-8">
          <div className="text-muted text-sm">Riot ID</div>
          <h1 className="mt-2 text-2xl font-bold sm:text-3xl md:text-4xl">
            {selectedAccount?.gameName || appConfig
              ? `${selectedAccount?.gameName ?? appConfig?.riotGameName}#${selectedAccount?.tagLine ?? appConfig?.riotTagLine}`
              : "Riot ID未同期"}
          </h1>
          <p className="text-muted mt-3 text-sm">
            データはRiot Games APIから取得しています
          </p>
        </section>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <GameSelector
            activeGame={activeGame}
            period={period}
            accountId={selectedAccount?.id}
          />
        </div>

        {riotAccounts.length > 0 ? (
          <section className="mt-4 flex flex-wrap gap-2">
            {riotAccounts.map((account) => {
              const label = account.gameName
                ? `${account.gameName}${account.tagLine ? `#${account.tagLine}` : ""}`
                : `アカウント ${account.id.slice(0, 6)}`;
              const params = new URLSearchParams({
                game: activeGame,
                period,
              });
              if (account.id) {
                params.set("account", account.id);
              }

              return (
                <a
                  key={account.id}
                  href={`/?${params.toString()}`}
                  className={[
                    "rounded-full border px-3 py-2 text-sm font-semibold transition",
                    account.id === selectedAccount?.id
                      ? "border-primary bg-primary text-surface"
                      : "border-border bg-surface-subtle text-muted hover:bg-primary-light",
                  ].join(" ")}
                >
                  {label}
                </a>
              );
            })}
          </section>
        ) : null}

        {activeGame === "lol" ? (
          <>
            <section className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-muted text-sm">
                対象期間: {getLolPeriodLabel(period)}
              </div>
              <LolPeriodFilter activePeriod={period} />
            </section>

            <section className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
              <div className="sm:col-span-2 md:col-span-1">
                <RankCard
                  tier={latestRank?.tier}
                  rank={latestRank?.rank}
                  lp={latestRank?.lp}
                  wins={latestRank?.wins}
                  losses={latestRank?.losses}
                  lpDiff={lpDiff}
                />
              </div>

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

            <section className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
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
              <PatchComparison comparison={patchComparison} />
            </section>

            <section className="mt-6">
              <RankChart data={rankChartData} />
            </section>

            <section className="mt-10">
              <h2 className="text-xl font-bold sm:text-2xl">最近の試合</h2>

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
            <section className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-muted text-sm">
                対象期間: {getTftPeriodLabel(period)}
              </div>
              <LolPeriodFilter activePeriod={period} />
            </section>

            <section className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
              <div className="sm:col-span-2 md:col-span-1">
                <RankCard
                  tier={latestTftRank?.tier}
                  rank={latestTftRank?.rank}
                  lp={latestTftRank?.lp}
                  wins={latestTftRank?.wins}
                  losses={latestTftRank?.losses}
                />
              </div>

              <StatCard
                label="Top4率"
                value={`${tftStats.top4Rate}%`}
                subText={`${tftStats.top4Count} / ${tftMatchesForDisplay.length}`}
              />

              <StatCard label="試合数" value={tftMatchesForDisplay.length} />
            </section>

            <section className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
              <TftTraitStats stats={tftTraitStats} />
              <TftUnitStats stats={tftUnitStats} />
            </section>

            <section className="mt-6 grid gap-4 lg:grid-cols-2">
              <TftAugmentStats stats={tftAugmentStats} />
              <TftPatchStats stats={tftPatchStats} />
            </section>

            <section className="mt-6">
              <TftPatchComparison comparison={tftPatchComparison} />
            </section>

            <section className="mt-6">
              <RankChart data={tftRankChartData} />
            </section>

            <section className="mt-10">
              <h2 className="text-xl font-bold sm:text-2xl">最近のTFT試合</h2>

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
