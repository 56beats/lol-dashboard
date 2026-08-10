"use client";

import {
  LabelList,
  Line,
  LineChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";

type RankChartItem = {
  date: string;
  score: number;
  label: string;
};

type Props = {
  data: RankChartItem[];
};

/**
 * LP推移グラフ
 * scoreは内部計算用、labelは画面表示用
 */
export function RankChart({ data }: Props) {
  return (
    <div className="border-border bg-surface rounded-2xl border p-5 shadow-lg backdrop-blur">
      <div className="mb-4">
        <h2 className="text-foreground text-xl font-bold">LP推移</h2>
        <p className="text-muted mt-1 text-sm">ランク昇格も考慮したLP推移</p>
      </div>

      <div className="h-64 min-w-0 sm:h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 24, right: 8, bottom: 8, left: 8 }}
          >
            <XAxis dataKey="date" stroke="var(--muted)" fontSize={12} />
            <YAxis hide />

            <Line
              type="monotone"
              dataKey="score"
              stroke="var(--primary)"
              strokeWidth={3}
              dot={{ r: 5 }}
            >
              <LabelList
                dataKey="label"
                position="top"
                offset={8}
                fill="var(--foreground)"
                fontSize={10}
              />
            </Line>
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
