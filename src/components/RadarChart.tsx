'use client';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';

export default function DiagnosticRadar({ stats }: { stats: any }) {
  // On transforme l'objet stats en tableau et ON TRIE par nom (numérique)
  const data = Object.entries(stats)
    .sort(([nameA], [nameB]) => nameA.localeCompare(nameB, undefined, { numeric: true }))
    .map(([name, d]: any) => ({
      subject: name.split('.')[1],
      A: d.totalWeight > 0 ? (d.totalWeightedNote / d.totalWeight) : 0,
      fullMark: 4,
    }));

  return (
    <div className="w-full h-full">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
          <PolarGrid stroke="#e2e8f0" />
          <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 11, fontWeight: 'bold' }} />
          <Radar
            name="Maturité"
            dataKey="A"
            stroke="#2563eb"
            fill="#3b82f6"
            fillOpacity={0.5}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}