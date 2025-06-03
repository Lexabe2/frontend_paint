import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import App from '../App';
import Dashboard from '../pages/Dashboard';
import AddRequestPage from '../pages/Application';
import Settings from '../pages/Settings';
import Logs from '../pages/Logs';
import PrivateRoute from '../components/PrivateRoute';
import Layout from '../layouts/Layout';

export default function MainRouter() {
  return (
    <Routes>
      {/* Логин — без layout */}
      <Route path="/login" element={<App />} />

      {/* Все защищённые маршруты — с layout и шапкой */}
      <Route
        element={
          <PrivateRoute>
            <Layout />
          </PrivateRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/application" element={<AddRequestPage />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/logs" element={<Logs />} />
        {/* Добавляй другие защищённые страницы здесь */}
      </Route>

      {/* Все прочие — на login */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
