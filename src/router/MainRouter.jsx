import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import App from '../App';
import Dashboard from '../pages/Dashboard';
import AddRequestPage from '../pages/Application';
import Settings from '../pages/Settings';
import Logs from '../pages/Logs';
import Registration from '../pages/Registration';
import RegistrationWork from '../pages/RegistrationWork';
import SearchPage from '../pages/Atm';
import ComplaintsPage from '../pages/Complaints';
import PrivateRoute from '../components/PrivateRoute';
import AddAtm from '../pages/AddAtm.jsx';
import WarehouseAtms from '../pages/WarehouseAtms.jsx'
import RequestsList from '../pages/RequestsList.jsx';
import BroadcastPaint from '../pages/BroadcastPaint.jsx'
import Painting from '../pages/Painting';
import Work from '../pages/WorkManager.jsx';
import Warehouse from '../pages/Warehouse.jsx';
import OTKSearch from '../pages/OTKSearch.jsx';
import OTK from '../pages/OTK.jsx';
import Corrections from '../pages/Corrections.jsx';
import AtmViewing from '../pages/ViewingAtms.jsx';
import Layout from '../layouts/Layout';
import StatusReq from "../pages/StatusReq.jsx";
import ATMStatusPage from "../pages/ChangesStatusAtm.jsx";
import ActCreatePage from "../pages/ActCreatePage.jsx";
import LogConsole from "../pages/Logs.jsx";

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
        <Route path="/registration" element={<Registration />} />
        <Route path="/requests/:id/receive" element={<RegistrationWork />} />
        <Route path="/atm" element={<SearchPage />} />
        <Route path="/complaints" element={<ComplaintsPage />} />
        <Route path="/add_atm" element={<AddAtm />} />
        <Route path="/warehouse_atms" element={<WarehouseAtms />} />
        <Route path="/viewing_req" element={<RequestsList />} />
        <Route path="/requests/:id/broadcast" element={<BroadcastPaint />} />
        <Route path="/painting/" element={<Painting />} />
        <Route path="/work/" element={<Work />} />
        <Route path="/warehouse/" element={<Warehouse />} />
        <Route path="/otk/" element={<OTKSearch />} />
        <Route path="/otk/:query/" element={<OTK />} />
        <Route path="/corrections/" element={<Corrections />} />
        <Route path="/viewing_atms/" element={<AtmViewing />} />
        <Route path="/status_req/:id/" element={<StatusReq />} />
        <Route path="/change_status_atm/" element={<ATMStatusPage />} />
        <Route path="/act/" element={<ActCreatePage />} />
        {/* Добавляй другие защищённые страницы здесь */}
      </Route>

      {/* Все прочие — на login */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
