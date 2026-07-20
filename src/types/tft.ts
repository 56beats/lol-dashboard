// ===== DB保存用の型 =====

export type TftTrait = {
  id: string;
  numUnits: number;
  tierCurrent: number;
  style?: number;
};

export type TftUnit = {
  id: string;
  tier: number;
  itemIds: string[];
};

export type TftSprite = {
  url: string;
  x: number;
  y: number;
  w: number;
  h: number;
};

// ===== UI表示用の型 =====

/**
 * 画面表示用アイテム
 */
export type TftDisplayItem = {
  id: string;
  name: string;
  imageUrl?: string;
  sprite?: TftSprite;
};

export type TftDisplayUnit = TftUnit & {
  name: string;
  imageUrl?: string;
  // CDragonが404の場合にコンポーネント側でDDragonへ切り替えるためのURL
  fallbackImageUrl?: string;
  sprite?: TftSprite;
  items: TftDisplayItem[];
};

export type TftDisplayTrait = TftTrait & {
  name: string;
  imageUrl?: string;
};

// ===== Riot API レスポンス型 =====

/**
 * TFT試合詳細のレスポンス型
 * Riot TFT V1 API より
 */
export type RiotTftMatchDetail = {
  metadata: {
    match_id: string;
  };
  info: {
    game_datetime?: number;
    participants: RiotTftParticipant[];
  };
};

/**
 * TFT試合内の1プレイヤーの情報
 */
export type RiotTftParticipant = {
  puuid: string;
  placement: number;
  level: number;
  last_round?: number;
  gold_left?: number;
  players_eliminated?: number;
  total_damage_to_players?: number;
  augments?: string[];
  traits?: RiotTftTrait[];
  units?: RiotTftUnit[];
  companion?: unknown;
};

/**
 * TFT特性（シナジー）の詳細情報
 */
export type RiotTftTrait = {
  name: string;
  num_units: number;
  tier_current: number;
  style?: number;
};

/**
 * TFTユニット（チャンピオン）の詳細情報
 */
export type RiotTftUnit = {
  character_id: string;
  tier: number;
  itemNames?: string[];
};
