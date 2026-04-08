import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import App from '../App';
import Dashboard from '../pages/Dashboard';
import Settings from '../pages/Settings';
import Logs from '../pages/Logs';
import RegistrationWork from '../pages/RegistrationWork';
import PrivateRoute from '../components/PrivateRoute';
import AddAtm from '../pages/AddAtm.jsx';
import WarehouseAtms from '../pages/WarehouseAtms.jsx'
import RequestsList from '../pages/RequestsList.jsx';
import BroadcastPaint from '../pages/BroadcastPaint.jsx'
import Work from '../pages/WorkManager.jsx';
import Warehouse from '../pages/Warehouse.jsx';
import AtmViewing from '../pages/ViewingAtms.jsx';
import Layout from '../layouts/Layout';
import StatusReq from "../pages/StatusReq.jsx";
import ATMStatusPage from "../pages/ChangesStatusAtm.jsx";
import PPAct from '../pages/PPAct';

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
        <Route path="/settings" element={<Settings />} />
        <Route path="/logs" element={<Logs />} />
        <Route path="/requests/:id/receive" element={<RegistrationWork />} />
        <Route path="/add_atm" element={<AddAtm />} />
        <Route path="/warehouse_atms" element={<WarehouseAtms />} />
        <Route path="/viewing_req" element={<RequestsList />} />
        <Route path="/requests/:id/broadcast" element={<BroadcastPaint />} />
        <Route path="/work/" element={<Work />} />
        <Route path="/warehouse/" element={<Warehouse />} />
        <Route path="/viewing_atms/" element={<AtmViewing />} />
        <Route path="/status_req/:id/" element={<StatusReq />} />
        <Route path="/change_status_atm/" element={<ATMStatusPage />} />
        <Route path="/act/" element={<ActCreatePage />} />
        <Route path="/drive_search/" element={<PPSearchGooglAtms />} />
        <Route path="/create_act_pp/" element={<PPAct />} />
        {/* Добавляй другие защищённые страницы здесь */}
      </Route>

      {/* Все прочие — на login */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
