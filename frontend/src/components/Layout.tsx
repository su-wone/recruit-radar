import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

export default function Layout() {
  return (
    <div style={{ minHeight: '100vh', background: '#0f172a', color: '#e2e8f0' }}>
      <Navbar />
      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '20px' }}>
        <Outlet />
      </main>
    </div>
  );
}
