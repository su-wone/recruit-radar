import { useEffect, useState } from 'react';
import { api } from '../api/client';
import CompanyCard from '../components/CompanyCard';

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<any[]>([]);
  const [industry, setIndustry] = useState('');
  const [size, setSize] = useState('');

  useEffect(() => {
    const params = new URLSearchParams();
    if (industry) params.set('industry', industry);
    if (size) params.set('size', size);
    api.getCompanies(params.toString()).then(setCompanies).catch(console.error);
  }, [industry, size]);

  const inputStyle = { background: '#334155', color: '#e2e8f0', border: '1px solid #475569', borderRadius: 6, padding: '8px 12px', fontSize: 13, flex: 1 };

  return (
    <div>
      <h2 style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 16 }}>회사 탐색</h2>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <input placeholder="업종 검색..." value={industry} onChange={(e) => setIndustry(e.target.value)} style={inputStyle} />
        <input placeholder="규모 검색..." value={size} onChange={(e) => setSize(e.target.value)} style={inputStyle} />
      </div>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        {companies.length > 0 ? companies.map((c) => <CompanyCard key={c.id} company={c} />) : <div style={{ color: '#94a3b8' }}>등록된 회사가 없습니다.</div>}
      </div>
    </div>
  );
}
