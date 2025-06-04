import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Outlet } from 'react-router-dom';
import Header from '../components/Header';
import api from '../api/axios'; // axios instance с токеном

export default function Layout() {
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await api.get('check-auth/');
        console.log("Тест")
        // если статус 200 — всё ок
      } catch (err) {
        console.warn('Сессия истекла или недействительна');
        localStorage.removeItem('access_token');
        navigate('/login');
      }
    };

    checkAuth(); // при монтировании

    const interval = setInterval(checkAuth, 60 * 60 * 1000); // каждые 60 минут
    

    return () => clearInterval(interval); // очистка при размонтировании
  }, [navigate]);

  return (
    <>
      <Header />
      <main className="p-4 pb-24">
        <Outlet />
      </main>
    </>
  );
}
