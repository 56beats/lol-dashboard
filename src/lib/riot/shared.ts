/**
 * Riot API共通設定
 *
 * LoL用とTFT用でProduct Keyを分離し、
 * 呼び出し側がどちらのゲームAPIを利用するか明示する。
 */

export const ACCOUNT_API_BASE_URL = "https://asia.api.riotgames.com";
export const LOL_API_BASE_URL = "https://jp1.api.riotgames.com";

/**
 * Riot APIで使用するゲーム種別
 */
export type RiotGame = "lol" | "tft";

/**
 * Riot API HTTPエラーを表す独自エラー型
 *
 * 汎用Errorと区別することで、
 * 呼び出し元が401・403・429などを判別できる。
 */
export class RiotApiError extends Error {
  constructor(
    public readonly status: number,
    message = `Riot API request failed: ${status}`
  ) {
    super(message);
    this.name = "RiotApiError";
  }
}

/**
 * RiotApiErrorをAPIレスポンス用のHTTPステータスへ変換する
 */
export function riotErrorToHttpStatus(error: unknown): number {
  if (error instanceof RiotApiError) {
    if (error.status === 401) {
      return 401;
    }

    if (error.status === 403) {
      return 403;
    }

    if (error.status === 429) {
      return 429;
    }

    /*
     * Riot API側の5xxエラーは、
     * アプリから見た外部サービス障害として502を返す。
     */
    if (error.status >= 500) {
      return 502;
    }

    /*
     * Riot APIから返されたその他の4xxも、
     * アプリ内部の500ではなく外部API由来として扱う。
     */
    return 502;
  }

  /*
   * fetchの通信失敗やDNS解決失敗などは、
   * 通常TypeErrorとしてthrowされる。
   */
  if (error instanceof TypeError) {
    return 503;
  }

  // Prismaエラーや予期しない内部エラー
  return 500;
}

/**
 * ゲームごとのRiot APIキーを取得する
 *
 * モジュール読込時ではなく、リクエスト実行時に取得することで、
 * Vercelやローカル環境での設定漏れを検出しやすくする。
 */
function getRiotApiKey(game: RiotGame): string {
  const apiKey =
    game === "lol"
      ? process.env.RIOT_API_KEY_LOL
      : process.env.RIOT_API_KEY_TFT;

  if (!apiKey) {
    throw new Error(`Riot API key is not configured for ${game}.`);
  }

  return apiKey;
}

/**
 * Riot APIへ渡す共通ヘッダー
 */
function getRiotHeaders(game: RiotGame): HeadersInit {
  return {
    "X-Riot-Token": getRiotApiKey(game),
  };
}

/**
 * Riot APIへの低レベル通信を共通化する
 *
 * 責務:
 * - APIキーの付与
 * - fetch実行
 * - キャッシュ無効化
 * - HTTPステータス確認
 * - JSON変換
 *
 * URL構築やLoL・TFT固有のデータ処理は呼び出し側で行う。
 *
 * HTTPエラー時はRiotApiErrorをthrowする。
 * 通信自体の失敗はTypeErrorのまま呼び出し側へ伝播する。
 *
 * 使用例:
 * const matchIds = await riotFetch<string[]>(url, "lol");
 * const tftMatch = await riotFetch<RiotTftMatch>(url, "tft");
 */
export async function riotFetch<T>(url: string, game: RiotGame): Promise<T> {
  const response = await fetch(url, {
    headers: getRiotHeaders(game),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new RiotApiError(response.status);
  }

  return response.json() as Promise<T>;
}
