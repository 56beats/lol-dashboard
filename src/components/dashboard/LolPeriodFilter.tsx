"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import type { LolPeriod } from "@/lib/dashboard/lol";

type Props = {
  activePeriod: LolPeriod;
};

const periods: Array<{ value: LolPeriod; label: string }> = [
  { value: "recent20", label: "最近20試合" },
  { value: "7d", label: "7日" },
  { value: "30d", label: "30日" },
  { value: "all", label: "全期間" },
];

export function LolPeriodFilter({ activePeriod }: Props) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return (
    <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto sm:flex-wrap">
      {periods.map((period) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("period", period.value);
        const accountId =
          searchParams.get("account") ?? searchParams.get("accountId");
        if (accountId) {
          params.set("account", accountId);
        }
        const href = `${pathname}?${params.toString()}`;
        const isActive = activePeriod === period.value;

        return (
          <Link
            key={period.value}
            href={href}
            className={[
              "flex min-h-11 items-center justify-center rounded-xl px-3 py-2 text-sm font-bold",
              isActive
                ? "bg-primary text-surface"
                : "bg-surface-subtle text-muted hover:bg-primary-light",
            ].join(" ")}
          >
            {period.label}
          </Link>
        );
      })}
    </div>
  );
}
