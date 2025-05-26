import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { getInitials } from '../utils/getInitials';

export default function UserInfo({ onUserLoaded }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get('/auth/me/', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('access_token')}`,
          },
        });
        setUser(res.data);
        if (onUserLoaded) {
          onUserLoaded({
            user: res.data,
            initials: getInitials(res.data.full_name),
          });
        }
      } catch (error) {
        console.error('Ошибка загрузки пользователя', error);
      }
    };

    fetchUser();
  }, [onUserLoaded]);

  if (!user) return <div>Загрузка...</div>;

  return (
    <div className="">
      <p className="text-sm font-medium">{user.full_name}</p>
      <p className="text-xs text-gray-500">{user.email}</p>
    </div>
  );
}
