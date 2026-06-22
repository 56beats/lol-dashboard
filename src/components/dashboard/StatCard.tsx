type Props = {
  label: string;
  value: string | number;
  subText?: string;
};

export function StatCard({ label, value, subText }: Props) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-lg backdrop-blur">
      <div className="text-sm text-slate-400">{label}</div>
      <div className="mt-3 text-3xl font-bold text-white">{value}</div>
      {subText && (
        <div className="mt-2 text-sm text-slate-400">{subText}</div>
      )}
    </div>
  );
}