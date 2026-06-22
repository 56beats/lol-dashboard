"use client";

import {
  LabelList,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
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
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-lg backdrop-blur">
      <div className="mb-4">
        <h2 className="text-xl font-bold text-white">LP推移</h2>
        <p className="mt-1 text-sm text-slate-400">
          ランク昇格も考慮したLP推移
        </p>
      </div>

      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 32, right: 24, bottom: 8, left: 24 }}
          >
            <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} />
            <YAxis hide />

            <Tooltip
              formatter={(_, __, item) => item.payload.label}
              labelFormatter={(label) => `${label}`}
            />

            <Line
              type="monotone"
              dataKey="score"
              stroke="#34d399"
              strokeWidth={3}
              dot={{ r: 5 }}
            >
              <LabelList
                dataKey="label"
                position="top"
                fill="#e2e8f0"
                fontSize={12}
              />
            </Line>
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
