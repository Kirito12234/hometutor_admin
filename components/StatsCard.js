export default function StatsCard({ title, value, color = "text-brand" }) {
  return (
    <div className="card">
      <p className="text-sm text-slate-500">{title}</p>
      <p className={`mt-2 text-3xl font-bold ${color}`}>{value}</p>
    </div>
  );
}

