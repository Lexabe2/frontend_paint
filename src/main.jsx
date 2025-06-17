import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import MainRouter from './router/MainRouter';
import ScrollToTop from './components/ScrollToTop';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ScrollToTop />
      <MainRouter />
    </BrowserRouter>
  </React.StrictMode>
);
