import { useEffect, useState } from 'react';
import { api } from '../api/client';
import JobTable from '../components/JobTable';

export default function JobListPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [source, setSource] = useState('');
  const [tech, setTech] = useState('');

  useEffect(() => {
    const params = new URLSearchParams();
    params.set('page', String(page));
    params.set('limit', '20');
    if (search) params.set('search', search);
    if (source) params.set('source', source);
    if (tech) params.set('tech', tech);
    api.getJobs(params.toString()).then((res) => { setJobs(res.data); setTotal(res.total); }).catch(console.error);
  }, [page, search, source, tech]);

  const inputStyle = { background: '#334155', color: '#e2e8f0', border: '1px solid #475569', borderRadius: 6, padding: '8px 12px', fontSize: 13 };

  return (
    <div>
      <h2 style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 16 }}>공고 목록</h2>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        <input placeholder="검색어 입력..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} style={{ ...inputStyle, flex: 2, minWidth: 200 }} />
        <select value={source} onChange={(e) => { setSource(e.target.value); setPage(1); }} style={inputStyle}>
          <option value="">출처: 전체</option>
          <option value="wanted">원티드</option>
          <option value="saramin">사람인</option>
        </select>
        <input placeholder="기술 스택..." value={tech} onChange={(e) => { setTech(e.target.value); setPage(1); }} style={{ ...inputStyle, minWidth: 120 }} />
      </div>
      <JobTable jobs={jobs} />
      {total > 20 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 16 }}>
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} style={{ ...inputStyle, cursor: 'pointer' }}>이전</button>
          <span style={{ color: '#cbd5e1', padding: '8px 12px' }}>{page} / {Math.ceil(total / 20)}</span>
          <button onClick={() => setPage((p) => p + 1)} disabled={page * 20 >= total} style={{ ...inputStyle, cursor: 'pointer' }}>다음</button>
        </div>
      )}
    </div>
  );
}
