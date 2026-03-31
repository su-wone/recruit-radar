import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<div>Dashboard (coming soon)</div>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
