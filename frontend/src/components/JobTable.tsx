const tagStyle = { background: '#1e3a5f', color: '#93c5fd', padding: '2px 6px', borderRadius: 4, fontSize: 11, marginRight: 4 };
const sourceColors: Record<string, string> = { wanted: '#34d399', saramin: '#fbbf24', jumpit: '#60a5fa', linkedin: '#a78bfa' };

export default function JobTable({ jobs }: { jobs: any[] }) {
  if (!jobs.length) return <div style={{ color: '#94a3b8' }}>공고가 없습니다.</div>;
  return (
    <table style={{ width: '100%', color: '#94a3b8', fontSize: 13, borderCollapse: 'collapse' }}>
      <thead><tr style={{ color: '#64748b', borderBottom: '1px solid #334155' }}>
        <th style={{ textAlign: 'left', padding: 8 }}>회사</th>
        <th style={{ textAlign: 'left', padding: 8 }}>포지션</th>
        <th style={{ textAlign: 'left', padding: 8 }}>기술스택</th>
        <th style={{ textAlign: 'left', padding: 8 }}>경력</th>
        <th style={{ textAlign: 'left', padding: 8 }}>연봉</th>
        <th style={{ textAlign: 'left', padding: 8 }}>출처</th>
        <th style={{ textAlign: 'left', padding: 8 }}>마감</th>
      </tr></thead>
      <tbody>{jobs.map((job) => (
        <tr key={job.id} style={{ borderBottom: '1px solid #1e293b' }}>
          <td style={{ padding: 8, color: '#e2e8f0' }}>{job.company?.name}</td>
          <td style={{ padding: 8 }}><a href={job.source_url} target="_blank" rel="noopener noreferrer" style={{ color: '#cbd5e1', textDecoration: 'none' }}>{job.title}</a></td>
          <td style={{ padding: 8 }}>{(job.tech_stacks || []).slice(0, 3).map((ts: any) => <span key={ts.name} style={tagStyle}>{ts.name}</span>)}</td>
          <td style={{ padding: 8 }}>{job.experience_min != null ? `${job.experience_min}${job.experience_max ? `~${job.experience_max}` : '+'}년` : '-'}</td>
          <td style={{ padding: 8 }}>{job.salary_min ? `${job.salary_min.toLocaleString()}~${(job.salary_max || 0).toLocaleString()}` : '협의'}</td>
          <td style={{ padding: 8 }}><span style={{ color: sourceColors[job.source_site] || '#94a3b8' }}>{job.source_site}</span></td>
          <td style={{ padding: 8 }}>{job.deadline || '상시'}</td>
        </tr>
      ))}</tbody>
    </table>
  );
}
