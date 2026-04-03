const BASE_URL = '/api';

async function fetchJson<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`);
  if (!res.ok) throw new Error(`API Error: ${res.status}`);
  return res.json();
}

export interface StatsResponse {
  total_jobs: number;
  total_companies: number;
  top_stack: { name: string; count: number } | null;
  avg_experience: number;
}

export interface TechStackItem { name: string; category: string; count: number; }
export interface ExperienceItem { range: string; count: number; }
export interface StackCombo { stacks: string[]; count: number; }

export const api = {
  getStatsSummary: () => fetchJson<StatsResponse>('/stats/summary'),
  getTechStackRanking: () => fetchJson<TechStackItem[]>('/stats/tech-stacks'),
  getExperienceDistribution: () => fetchJson<ExperienceItem[]>('/stats/experience'),
  getStackCombos: () => fetchJson<StackCombo[]>('/stats/combos'),
  getCompanies: (params?: string) => fetchJson<any[]>(`/companies${params ? `?${params}` : ''}`),
  getJobs: (params?: string) => fetchJson<any>(`/jobs${params ? `?${params}` : ''}`),
};
