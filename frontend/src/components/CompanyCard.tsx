const tagStyle = { background: '#1e3a5f', color: '#93c5fd', padding: '3px 8px', borderRadius: 4, fontSize: 12, marginRight: 4 };

export default function CompanyCard({ company }: { company: any }) {
  const jobCount = company.job_postings?.length || 0;
  const stackCounts = new Map<string, number>();
  (company.job_postings || []).forEach((jp: any) => (jp.tech_stacks || []).forEach((ts: any) => stackCounts.set(ts.name, (stackCounts.get(ts.name) || 0) + 1)));
  const topStacks = [...stackCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3).map(([name]) => name);
  const salaries = (company.job_postings || []).filter((jp: any) => jp.salary_min || jp.salary_max).flatMap((jp: any) => [jp.salary_min, jp.salary_max].filter(Boolean) as number[]);
  const salaryMin = salaries.length ? Math.min(...salaries) : null;
  const salaryMax = salaries.length ? Math.max(...salaries) : null;

  return (
    <div style={{ background: '#1e293b', borderRadius: 10, padding: 18, minWidth: 220, flex: 1, border: '1px solid #334155' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <span style={{ color: '#e2e8f0', fontWeight: 'bold', fontSize: 16 }}>{company.name}</span>
        <span style={{ background: '#064e3b', color: '#34d399', padding: '3px 10px', borderRadius: 10, fontSize: 12 }}>채용중 {jobCount}건</span>
      </div>
      <div style={{ color: '#94a3b8', fontSize: 13, marginBottom: 10 }}>{[company.industry, company.size].filter(Boolean).join(' · ') || '-'}</div>
      {topStacks.length > 0 && (<><div style={{ color: '#cbd5e1', fontSize: 12, marginBottom: 6 }}>주요 요구 스택:</div><div style={{ marginBottom: 10 }}>{topStacks.map((s) => <span key={s} style={tagStyle}>{s}</span>)}</div></>)}
      {salaryMin && salaryMax ? (
        <div style={{ color: '#cbd5e1', fontSize: 13 }}>연봉 범위: <span style={{ color: '#34d399', fontWeight: 500 }}>{salaryMin.toLocaleString()}~{salaryMax.toLocaleString()}만</span></div>
      ) : <div style={{ color: '#64748b', fontSize: 13 }}>연봉 정보 없음</div>}
    </div>
  );
}
