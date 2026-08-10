type Props = {
  label: string;
  value: string | number;
  subText?: string;
};

export function StatCard({ label, value, subText }: Props) {
  return (
    <div className="border-border bg-surface rounded-2xl border p-4 shadow-lg backdrop-blur sm:p-5">
      <div className="text-muted text-sm">{label}</div>
      <div className="text-foreground mt-3 text-2xl font-bold sm:text-3xl">
        {value}
      </div>
      {subText && <div className="text-muted mt-2 text-sm">{subText}</div>}
    </div>
  );
}
