import { NavLink } from 'react-router-dom';

const linkStyle = { color: '#cbd5e1', textDecoration: 'none', fontSize: '13px' };
const activeStyle = { ...linkStyle, color: '#60a5fa', fontWeight: 500 as const };

export default function Navbar() {
  return (
    <nav style={{
      display: 'flex', alignItems: 'center', gap: 16,
      padding: '12px 20px', background: '#0f172a', borderBottom: '1px solid #1e293b',
    }}>
      <span style={{ color: '#e2e8f0', fontWeight: 'bold', fontSize: 16, marginRight: 16 }}>
        JobScout
      </span>
      <NavLink to="/" style={({ isActive }) => isActive ? activeStyle : linkStyle}>
        시장 분석
      </NavLink>
      <NavLink to="/companies" style={({ isActive }) => isActive ? activeStyle : linkStyle}>
        회사 탐색
      </NavLink>
      <NavLink to="/jobs" style={({ isActive }) => isActive ? activeStyle : linkStyle}>
        공고 목록
      </NavLink>
    </nav>
  );
}
