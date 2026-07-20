/**
 * Riot API共通設定
 *
 * APIキーやベースURLを1箇所にまとめておくと、
 * 後からTFT対応や地域変更をするときに修正箇所が少なくなる。
 */

export const API_KEY = process.env.RIOT_API_KEY!;

export const ACCOUNT_API_BASE_URL = "https://asia.api.riotgames.com";
export const LOL_API_BASE_URL = "https://jp1.api.riotgames.com";

/**
 * Riot API HTTPエラーを表す独自エラー型
 *
 * 汎用 Error と区別することで、呼び出し元が 401/429 などを判別できる。
 * extends Error のため、既存の catch(error) や instanceof Error は引き続き動作する。
 */
export class RiotApiError extends Error {
  constructor(
    public readonly status: number,
    message = `Riot API request failed: ${status}`,
  ) {
    super(message);
    this.name = "RiotApiError";
  }
}

/**
 * RiotApiError のステータスに応じたHTTPレスポンスコードへ変換する
 *
 * Riot API側のエラーは 502（Bad Gateway）として返す。
 * 通信自体の失敗（TypeError）は 503（Service Unavailable）として返す。
 */
export function riotErrorToHttpStatus(error: unknown): number {
  if (error instanceof RiotApiError) {
    const s = error.status;
    if (s === 401) return 401;
    if (s === 403) return 403;
    if (s === 429) return 429;
    if (s >= 500) return 502;
    return 502;
  }
  // fetch 通信失敗（ネットワーク切断・DNS解決失敗など）は TypeError
  if (error instanceof TypeError) return 503;
  // Prismaエラー・その他の内部エラー
  return 500;
}

/**
 * Riot APIへ渡す共通ヘッダー
 */
export function getRiotHeaders() {
  return {
    "X-Riot-Token": API_KEY,
  };
}

/**
 * Riot API への低レベル通信を共通化
 *
 * 責務: fetch実行、ヘッダー付与、キャッシュ設定、ステータス確認、JSON変換
 * 不含: URL構築、ドメイン固有処理、エラーカスタマイズ
 *
 * HTTPエラー時は RiotApiError をthrowする。
 * 通信自体の失敗（ネットワークエラー）は TypeError のまま伝播する。
 *
 * 使用例:
 * const matchIds = await riotFetch<string[]>(url);
 * const entry = await riotFetch<RiotLeagueEntry>(url);
 */
export async function riotFetch<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    headers: getRiotHeaders(),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new RiotApiError(response.status);
  }

  return response.json();
}
