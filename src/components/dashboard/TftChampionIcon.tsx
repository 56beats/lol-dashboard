"use client";

import { useState } from "react";
import Image from "next/image";

// CDragon → DDragon → プレースホルダー の順に試行する状態
type ImageSource = "primary" | "fallback" | "placeholder";

type Props = {
  name: string;
  imageUrl: string;
  // CDragonが404の場合に使うDDragon URL
  fallbackImageUrl?: string;
  size?: number;
};

export function TftChampionIcon({
  name,
  imageUrl,
  fallbackImageUrl,
  size = 40,
}: Props) {
  const [source, setSource] = useState<ImageSource>("primary");

  const handleError = () => {
    // primary が失敗 → fallback があれば試す。なければ即プレースホルダー
    if (source === "primary" && fallbackImageUrl) {
      setSource("fallback");
    } else {
      setSource("placeholder");
    }
  };

  if (source === "placeholder") {
    return (
      <div
        aria-label={name}
        className="rounded-md border border-white/10 bg-white/10"
        style={{ width: size, height: size }}
      />
    );
  }

  const currentUrl = source === "primary" ? imageUrl : fallbackImageUrl;

  // fallbackImageUrl が undefined のまま "fallback" 状態になった場合の安全策
  if (!currentUrl) {
    return (
      <div
        aria-label={name}
        className="rounded-md border border-white/10 bg-white/10"
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <Image
      src={currentUrl}
      alt={name}
      width={size}
      height={size}
      className="rounded-md object-cover"
      onError={handleError}
    />
  );
}
