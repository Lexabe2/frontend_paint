import { useState } from 'react';
import React from 'react';
import { LoginStep, TelegramStep, CodeStep } from './components';
import { useNavigate } from 'react-router-dom';
import api from './api/axios';

export default function App() {
  const [step, setStep] = useState(1);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [telegramId, setTelegramId] = useState('');
  const [token, setToken] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const res = await api.post('/auth/login-step-1/', { username, password });
      const receivedToken = res.data.token;
      setToken(receivedToken);
      localStorage.setItem('access_token', receivedToken); // сохраняем токен

      if (res.data.has_telegram_id) {
        setStep(3);
      } else {
        setStep(2);
      }
    } catch {
      alert('Ошибка входа');
    }
  };

  const handleSetTelegramId = async () => {
    try {
      await api.post('/auth/set-telegram-id/',
        { username, telegram_id: telegramId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setStep(3);
    } catch {
      alert('Ошибка при добавлении Telegram ID');
    }
  };

  const handleVerify = async () => {
    try {
      const res = await api.post('/auth/verify-code/', { username, code });
      localStorage.setItem('access_token', res.data.access); // сохраняем новый токен
      navigate('/dashboard'); // переходим на защищённую страницу
    } catch {
      alert('Неверный код');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 space-y-8">

        {step === 1 && <LoginStep {...{ username, password, setUsername, setPassword, onLogin: handleLogin }} />}
        {step === 2 && <TelegramStep {...{ telegramId, setTelegramId, onSubmit: handleSetTelegramId }} />}
        {step === 3 && <CodeStep {...{ code, setCode, onVerify: handleVerify }} />}

        {step > 1 && (
          <div className="text-center text-sm text-gray-600">
            <button className="text-blue-500 hover:text-blue-600" onClick={() => setStep(step - 1)}>
              ← Назад
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
