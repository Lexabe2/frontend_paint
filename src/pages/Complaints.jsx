import React, { useEffect, useState } from 'react';
import api from '../api/axios';

export default function ComplaintsPage() {
  const [complaints, setComplaints] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const response = await api.get('/complaints/');
        setComplaints(response.data);
      } catch (error) {
        console.error('Ошибка при загрузке жалоб:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchComplaints();
  }, []);

  if (loading) return <p>Загрузка...</p>;

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Жалобы / Отправленные заявки</h1>
      {Object.entries(complaints).length === 0 ? (
        <p>Нет отправленных заявок</p>
      ) : (
        Object.entries(complaints).map(([requestId, serials]) => (
          <div key={requestId} className="mb-6 p-4 border rounded shadow">
            <h2 className="text-lg font-semibold">Заявка № {requestId}</h2>
            <ul className="list-disc list-inside mt-2">
              {serials.map((serial, index) => (
                <li key={index}>{serial}</li>
              ))}
            </ul>
          </div>
        ))
      )}
    </div>
  );
}