import { StatsResponse } from '../api/client';

const cardStyle = {
  background: '#1e293b', border: '1px solid #334155', borderRadius: 10,
  padding: 18, flex: 1, minWidth: 140, textAlign: 'center' as const,
};

export default function SummaryCards({ data }: { data: StatsResponse | null }) {
  if (!data) return null;
  return (
    <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
      <div style={cardStyle}>
        <div style={{ color: '#cbd5e1', fontSize: 12, marginBottom: 6 }}>현재 채용중</div>
        <div style={{ color: '#60a5fa', fontSize: 28, fontWeight: 'bold' }}>{data.total_jobs.toLocaleString()}</div>
      </div>
      <div style={cardStyle}>
        <div style={{ color: '#cbd5e1', fontSize: 12, marginBottom: 6 }}>채용 회사 수</div>
        <div style={{ color: '#34d399', fontSize: 28, fontWeight: 'bold' }}>{data.total_companies.toLocaleString()}</div>
      </div>
      <div style={cardStyle}>
        <div style={{ color: '#cbd5e1', fontSize: 12, marginBottom: 6 }}>가장 많이 요구</div>
        <div style={{ color: '#fbbf24', fontSize: 22, fontWeight: 'bold' }}>{data.top_stack?.name || '-'}</div>
        <div style={{ color: '#94a3b8', fontSize: 12, marginTop: 4 }}>{data.top_stack?.count.toLocaleString() || 0}건</div>
      </div>
      <div style={cardStyle}>
        <div style={{ color: '#cbd5e1', fontSize: 12, marginBottom: 6 }}>평균 요구 경력</div>
        <div style={{ color: '#e2e8f0', fontSize: 28, fontWeight: 'bold' }}>{data.avg_experience}년</div>
      </div>
    </div>
  );
}
