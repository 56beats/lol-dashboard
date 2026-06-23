import type { TftSprite } from "@/types/tft";

type Props = {
  sprite?: TftSprite;
  alt: string;
  size?: number;
};

/**
 * TFT Data Dragonのsprite画像からアイコンを切り抜いて表示する
 *
 * 一部TFTデータではx座標が1マス右にズレているように見えるため、
 * 48px単位で左に1マス補正している。
 */
export function TftSpriteIcon({ sprite, alt, size = 48 }: Props) {
  if (!sprite) {
    return (
      <div
        aria-label={alt}
        className="rounded-xl border border-white/10 bg-white/10"
        style={{ width: size, height: size }}
      />
    );
  }

  const correctedX = Math.max(sprite.x - sprite.w, 0);
  const scale = size / sprite.w;

  return (
    <div
      aria-label={alt}
      title={alt}
      className="overflow-hidden rounded-xl border border-white/10 bg-black/20 bg-no-repeat"
      style={{
        width: size,
        height: size,
        backgroundImage: `url(${sprite.url})`,
        backgroundPosition: `-${correctedX * scale}px -${sprite.y * scale}px`,
        backgroundSize: size === 48 ? "auto" : `${1024 * scale}px auto`,
      }}
    />
  );
}
