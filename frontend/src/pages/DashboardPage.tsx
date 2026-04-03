import { useEffect, useState } from 'react';
import { api, StatsResponse, TechStackItem, ExperienceItem, StackCombo } from '../api/client';
import SummaryCards from '../components/SummaryCards';
import TechStackRanking from '../components/TechStackRanking';
import StackCombos from '../components/StackCombos';
import ExperienceChart from '../components/ExperienceChart';

export default function DashboardPage() {
  const [summary, setSummary] = useState<StatsResponse | null>(null);
  const [techStacks, setTechStacks] = useState<TechStackItem[]>([]);
  const [experience, setExperience] = useState<ExperienceItem[]>([]);
  const [combos, setCombos] = useState<StackCombo[]>([]);

  useEffect(() => {
    api.getStatsSummary().then(setSummary).catch(console.error);
    api.getTechStackRanking().then(setTechStacks).catch(console.error);
    api.getExperienceDistribution().then(setExperience).catch(console.error);
    api.getStackCombos().then(setCombos).catch(console.error);
  }, []);

  return (
    <div>
      <h2 style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 16 }}>시장 분석</h2>
      <SummaryCards data={summary} />
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        <TechStackRanking data={techStacks} />
        <StackCombos data={combos} />
      </div>
      <ExperienceChart data={experience} />
    </div>
  );
}
