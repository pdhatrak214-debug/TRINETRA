import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from '@/components/Layout';
import CommandCenter from '@/pages/CommandCenter';
import RiskIntelligence from '@/pages/RiskIntelligence';
import TacticalResponse from '@/pages/TacticalResponse';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<CommandCenter />} />
          <Route path="/risk-intelligence" element={<RiskIntelligence />} />
          <Route path="/tactical-response" element={<TacticalResponse />} />
          <Route path="*" element={<CommandCenter />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
