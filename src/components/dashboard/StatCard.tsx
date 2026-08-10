type Props = {
  label: string;
  value: string | number;
  subText?: string;
};

export function StatCard({ label, value, subText }: Props) {
  return (
    <div className="border-border bg-surface rounded-2xl border p-5 shadow-lg backdrop-blur">
      <div className="text-muted text-sm">{label}</div>
      <div className="text-foreground mt-3 text-3xl font-bold">{value}</div>
      {subText && <div className="text-muted mt-2 text-sm">{subText}</div>}
    </div>
  );
}
