const API_KEY = process.env.RIOT_API_KEY!;

export async function getAccount() {
  const gameName = process.env.RIOT_GAME_NAME!;
  const tagLine = process.env.RIOT_TAG_LINE!;

  const response = await fetch(
    `https://asia.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`,
    {
      headers: {
        "X-Riot-Token": API_KEY,
      },
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error(`Riot API Error: ${response.status}`);
  }

  return response.json();
}

export async function getMatchIds(puuid: string, count = 20) {
  const response = await fetch(
    `https://asia.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?start=0&count=${count}`,
    {
      headers: {
        "X-Riot-Token": API_KEY,
      },
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch match ids");
  }

  return response.json();
}

export async function getMatch(matchId: string) {
  const response = await fetch(
    `https://asia.api.riotgames.com/lol/match/v5/matches/${matchId}`,
    {
      headers: {
        "X-Riot-Token": API_KEY,
      },
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch match");
  }

  return response.json();
}

export function extractMyParticipant(match: any, puuid: string) {
  return match.info.participants.find((p: any) => p.puuid === puuid);
}
