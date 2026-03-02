import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Assignment from './pages/Assignment';
import Playground from './pages/Playground';
import Leaderboard from './pages/Leaderboard';

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/assignments" element={<Dashboard />} />
        <Route path="/assignments/:id" element={<Assignment />} />
        <Route path="/playground" element={<Playground />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}
