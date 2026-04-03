import { TechStackItem } from '../api/client';

export default function TechStackRanking({ data }: { data: TechStackItem[] }) {
  if (!data.length) return <div style={{ color: '#94a3b8' }}>데이터 없음</div>;
  const maxCount = data[0]?.count || 1;
  return (
    <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 10, padding: 18, flex: 1, minWidth: 280 }}>
      <div style={{ color: '#e2e8f0', fontWeight: 'bold', fontSize: 14, marginBottom: 14 }}>기술 스택 수요 랭킹</div>
      {data.slice(0, 10).map((item, i) => (
        <div key={item.name} style={{ marginBottom: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <span style={{ color: '#cbd5e1', fontSize: 13 }}>{i + 1}. {item.name}</span>
            <span style={{ color: '#60a5fa', fontWeight: 500, fontSize: 13 }}>{item.count}건</span>
          </div>
          <div style={{ background: '#334155', borderRadius: 4, height: 6 }}>
            <div style={{ background: '#60a5fa', width: `${(item.count / maxCount) * 100}%`, height: 6, borderRadius: 4 }} />
          </div>
        </div>
      ))}
    </div>
  );
}
