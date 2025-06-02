import React, { useEffect, useState, useRef } from 'react';
import { RefreshCcw } from 'lucide-react';
import api from '../api/axios';

export default function Logs() {
  const [logs, setLogs] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const logRef = useRef(null);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const response = await api.get('logs/');
      if (response.data.logs) {
        setLogs(response.data.logs);
        setError(null);
      } else if (response.data.error) {
        setError(response.data.error);
      }
    } catch (err) {
      setError(err.toString());
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [logs]);

  const getColor = (line) => {
    if (line.includes('ERROR')) return 'text-red-400';
    if (line.includes('WARNING')) return 'text-yellow-300';
    if (line.includes('DEBUG')) return 'text-blue-300';
    if (line.includes('INFO')) return 'text-green-300';
    return 'text-gray-300';
  };

  return (
    <div className="max-w-5xl mx-auto p-4">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xl font-semibold text-white">Серверные логи</h2>
        <button
          onClick={fetchLogs}
          className="flex items-center gap-1 text-sm bg-gray-800 text-white px-3 py-1.5 rounded hover:bg-gray-700 transition"
        >
          <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Обновить
        </button>
      </div>

      <div
        ref={logRef}
        className="bg-black rounded-xl p-4 h-[500px] overflow-y-auto shadow-inner border border-gray-700"
      >
        {error && <p className="text-red-400">{error}</p>}
        {logs.length === 0 && !error && (
          <p className="text-gray-400 italic">Логи пока пусты...</p>
        )}
        {logs.map((line, idx) => (
          <div key={idx} className={`font-mono text-sm ${getColor(line)}`}>
            {line.trim()}
          </div>
        ))}
      </div>
    </div>
  );
}
