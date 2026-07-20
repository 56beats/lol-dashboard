"use client";

import Image from "next/image";
import type {
  TftDisplayItem,
  TftDisplayTrait,
  TftDisplayUnit,
} from "@/types/tft";
import { getTraitBadgeClass } from "@/lib/tft/display";
import { TftSpriteIcon } from "@/components/dashboard/TftSpriteIcon";
import { TftChampionIcon } from "@/components/dashboard/TftChampionIcon";

type TftMatchCardDetailProps = {
  augments: TftDisplayItem[];
  traits: TftDisplayTrait[];
  units: TftDisplayUnit[];
};

/**
 * TFTマッチカードの詳細セクション
 * オーグメント、全ユニット、全特性を表示
 */
export function TftMatchCardDetail({
  augments,
  traits,
  units,
}: TftMatchCardDetailProps) {
  return (
    <div className="mt-5 space-y-5 border-t border-white/10 pt-5">
      <div>
        <div className="text-xs font-bold text-slate-400">オーグメント</div>
        <div className="mt-2 flex flex-wrap gap-2">
          {augments.map((augment) => (
            <div
              key={augment.id}
              className="flex items-center gap-2 rounded-lg bg-white/10 px-2 py-1"
            >
              {augment.imageUrl && (
                <Image
                  src={augment.imageUrl}
                  alt={augment.name}
                  width={24}
                  height={24}
                  className="rounded"
                />
              )}
              <span className="text-xs text-slate-200">{augment.name}</span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="text-xs font-bold text-slate-400">全ユニット</div>
        <div className="mt-2 space-y-2">
          {units.map((unit) => (
            <div
              key={unit.id}
              className="flex items-center justify-between rounded-xl bg-white/10 px-3 py-2"
            >
              <div className="flex items-center gap-2">
                {/* CommunityDragonの個別画像がある場合はそちらを優先して表示する */}
                {unit.imageUrl ? (
                  <TftChampionIcon
                    name={unit.name}
                    imageUrl={unit.imageUrl}
                    fallbackImageUrl={unit.fallbackImageUrl}
                    size={48}
                  />
                ) : (
                  <TftSpriteIcon
                    sprite={unit.sprite}
                    alt={unit.name}
                    size={48}
                  />
                )}
                <div>
                  <div className="text-sm font-bold text-white">
                    ★{unit.tier} {unit.name}
                  </div>
                </div>
              </div>
              <div className="flex gap-1">
                {unit.items.map((item) =>
                  item.imageUrl ? (
                    <Image
                      key={item.id}
                      src={item.imageUrl}
                      alt={item.name}
                      width={24}
                      height={24}
                      // アイテム画像は個別URLを優先して表示する
                      className="rounded object-cover"
                    />
                  ) : item.sprite ? (
                    <TftSpriteIcon
                      key={item.id}
                      sprite={item.sprite}
                      alt={item.name}
                      size={24}
                    />
                  ) : (
                    <span
                      key={item.id}
                      className="rounded bg-black/30 px-2 py-1 text-xs text-slate-300"
                    >
                      {item.name}
                    </span>
                  )
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="text-xs font-bold text-slate-400">全特性</div>
        <div className="mt-2 flex flex-wrap gap-2">
          {traits.map((trait) => (
            <span
              key={trait.id}
              className={[
                "flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-bold",
                getTraitBadgeClass(trait.style),
              ].join(" ")}
            >
              {/* Trait画像がある場合はアイコンを表示する */}
              {trait.imageUrl && (
                <Image
                  src={trait.imageUrl}
                  alt={trait.name}
                  width={18}
                  height={18}
                  className="object-contain"
                />
              )}

              <span>
                {trait.name} {trait.numUnits}
              </span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
