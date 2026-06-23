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
  sprite?: TftSprite;
  items: TftDisplayItem[];
};

export type TftDisplayTrait = TftTrait & {
  name: string;
  imageUrl?: string;
};

type TftDisplayData = {
  id: string;
  name: string;
  imageUrl?: string;
  sprite?: {
    url: string;
    x: number;
    y: number;
    w: number;
    h: number;
  };
};
