import { StackCombo } from '../api/client';

const tagStyle = { background: '#1e3a5f', color: '#93c5fd', padding: '3px 8px', borderRadius: 4, fontSize: 12 };

export default function StackCombos({ data }: { data: StackCombo[] }) {
  if (!data.length) return <div style={{ color: '#94a3b8' }}>데이터 없음</div>;
  return (
    <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 10, padding: 18, flex: 1, minWidth: 280 }}>
      <div style={{ color: '#e2e8f0', fontWeight: 'bold', fontSize: 14, marginBottom: 14 }}>자주 함께 요구되는 스택 조합</div>
      {data.slice(0, 5).map((combo, i) => (
        <div key={i} style={{ marginBottom: 10, fontSize: 13, lineHeight: 1.8 }}>
          {combo.stacks.map((s, j) => (
            <span key={s}>{j > 0 && <span style={{ color: '#64748b' }}> + </span>}<span style={tagStyle}>{s}</span></span>
          ))}
          <span style={{ color: '#94a3b8', marginLeft: 8 }}>{combo.count}건</span>
        </div>
      ))}
    </div>
  );
}
