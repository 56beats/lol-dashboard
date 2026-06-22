import { ACCOUNT_API_BASE_URL, getRiotHeaders } from "./shared";

/**
 * PUUIDから最新の試合ID一覧を取得する
 *
 * 試合詳細は重いので、まずIDだけ取得する。
 * DBに存在しないIDだけ詳細取得するとAPI呼び出しを減らせる。
 */
export async function getMatchIds(puuid: string, count = 20) {
  const response = await fetch(
    `${ACCOUNT_API_BASE_URL}/lol/match/v5/matches/by-puuid/${encodeURIComponent(
      puuid
    )}/ids?start=0&count=${count}`,
    {
      headers: getRiotHeaders(),
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch match ids: ${response.status}`);
  }

  return response.json();
}

/**
 * matchIdから試合詳細を取得する
 */
export async function getMatch(matchId: string) {
  const response = await fetch(
    `${ACCOUNT_API_BASE_URL}/lol/match/v5/matches/${encodeURIComponent(
      matchId
    )}`,
    {
      headers: getRiotHeaders(),
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch match: ${response.status}`);
  }

  return response.json();
}

/**
 * 試合詳細JSONから自分の参加者データだけを取り出す
 *
 * participantsには10人分入っているので、
 * 自分のPUUIDと一致するものだけを使う。
 */
export function extractMyParticipant(match: any, puuid: string) {
  return match.info.participants.find((p: any) => p.puuid === puuid);
}
