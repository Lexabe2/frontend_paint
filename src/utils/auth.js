import axios from 'axios';
import api from '../api/axios';

export async function checkAuth() {
  const access = localStorage.getItem('access_token');
  const refresh = localStorage.getItem('refresh_token');

  try {
    await api.post('/token/verify/', { token: access });
    return true;
  } catch (err) {
    // access истёк
    if (refresh) {
      try {
        const res = await api.post('/token/refresh/', { refresh });
        localStorage.setItem('access_token', res.data.access);
        return true;
      } catch {
        // refresh тоже истёк
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        return false;
      }
    }
    return false;
  }
}
