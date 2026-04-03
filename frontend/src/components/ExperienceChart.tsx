import { ExperienceItem } from '../api/client';

const colors: Record<string, string> = { '신입': '#34d399', '1~3년': '#60a5fa', '3~5년': '#fbbf24', '5~10년': '#f87171', '10년+': '#a78bfa' };

export default function ExperienceChart({ data }: { data: ExperienceItem[] }) {
  if (!data.length) return <div style={{ color: '#94a3b8' }}>데이터 없음</div>;
  const maxCount = Math.max(...data.map((d) => d.count));
  return (
    <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 10, padding: 18, marginTop: 16 }}>
      <div style={{ color: '#e2e8f0', fontWeight: 'bold', fontSize: 14, marginBottom: 14 }}>경력별 공고 분포</div>
      <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end', height: 110 }}>
        {data.map((item) => {
          const color = colors[item.range] || '#94a3b8';
          return (
            <div key={item.range} style={{ flex: 1, textAlign: 'center' }}>
              <div style={{ background: color, height: (item.count / maxCount) * 100, borderRadius: '4px 4px 0 0' }} />
              <div style={{ color: '#cbd5e1', fontSize: 12, marginTop: 6 }}>{item.range}</div>
              <div style={{ color, fontSize: 13, fontWeight: 500 }}>{item.count}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
