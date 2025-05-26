import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../components/Header';

export default function Layout() {
  return (
    <>
      <Header />
      <main className="p-4">
        <Outlet />
      </main>
    </>
  );
}
