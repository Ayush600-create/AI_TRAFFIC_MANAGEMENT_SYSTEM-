import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import VideoAnalysis from './pages/VideoAnalysis';
import Records from './pages/Records';
import Reports from './pages/Reports';

import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/analysis" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="analysis" element={<VideoAnalysis />} />
          <Route path="records" element={<Records />} />
          <Route path="records/:id" element={<Records />} />
          <Route path="reports" element={<Reports />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
