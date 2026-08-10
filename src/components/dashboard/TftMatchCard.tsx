"use client";

import Image from "next/image";
import { useState } from "react";
import type {
  TftDisplayItem,
  TftDisplayTrait,
  TftDisplayUnit,
} from "@/types/tft";
import { getTraitBadgeClass } from "@/lib/tft/display";
import { TftSpriteIcon } from "@/components/dashboard/TftSpriteIcon";
import { TftChampionIcon } from "@/components/dashboard/TftChampionIcon";
import { TftMatchCardDetail } from "@/components/dashboard/TftMatchCardDetail";

type Props = {
  placement: number;
  level: number;
  augments: TftDisplayItem[];
  traits: TftDisplayTrait[];
  units: TftDisplayUnit[];
  playedAt: Date;
};

/**
 * TFTの1試合カード
 *
 * 通常時は順位・主要特性・主要ユニットだけ表示し、
 * クリック時にオーグメントや全ユニット詳細を展開する。
 */
export function TftMatchCard({
  placement,
  level,
  augments,
  traits,
  units,
  playedAt,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const isTop4 = placement <= 4;

  const mainTraits = traits.slice(0, 4);
  const mainUnits = units;

  return (
    <button
      type="button"
      onClick={() => setIsOpen((current) => !current)}
      className={[
        "bg-surface hover:bg-surface-subtle w-full rounded-2xl border p-4 text-left shadow-lg backdrop-blur transition",
        isTop4 ? "border-success" : "border-danger",
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <div
            className={[
              "text-2xl font-bold",
              isTop4 ? "text-success" : "text-danger",
            ].join(" ")}
          >
            {placement}位
          </div>

          <div className="text-muted mt-1 text-sm">
            Lv.{level} / {playedAt.toLocaleDateString("ja-JP")}
          </div>
        </div>

        <div className="text-muted text-sm">{isOpen ? "閉じる" : "詳細"}</div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {mainTraits.map((trait) => (
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

      <div className="mt-4 flex flex-wrap gap-2">
        {mainUnits.map((unit) => (
          <div key={unit.id} className="flex items-center gap-1">
            {/* CommunityDragonの個別画像がある場合はそちらを優先して表示する */}
            {unit.imageUrl ? (
              <TftChampionIcon
                name={unit.name}
                imageUrl={unit.imageUrl}
                fallbackImageUrl={unit.fallbackImageUrl}
                size={48}
              />
            ) : (
              <TftSpriteIcon sprite={unit.sprite} alt={unit.name} size={48} />
            )}
            <span className="text-muted text-xs">★{unit.tier}</span>
          </div>
        ))}
      </div>

      {isOpen && (
        <TftMatchCardDetail augments={augments} traits={traits} units={units} />
      )}
    </button>
  );
}
