import React from 'react';
import ReactDOM from 'react-dom/client';
import {BrowserRouter} from 'react-router-dom';
import MainRouter from './router/MainRouter';
import ScrollToTop from './components/ScrollToTop';
import LogConsole from "./pages/Logs.jsx"; // ✅ лучше держать в components/
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
    <BrowserRouter>
        <ScrollToTop/>
        <MainRouter/>
        <LogConsole/>
    </BrowserRouter>
);