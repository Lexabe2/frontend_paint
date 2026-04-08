import { useState, useEffect, useCallback } from "react";
import api from "../api/axios";
import debounce from "lodash/debounce"; // или напиши свой debounce

export default function SheetSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isAuthorized, setIsAuthorized] = useState(null); // null = ещё не проверяли
  const [userId, setUserId] = useState(null);

  // Проверяем авторизацию один раз при монтировании
  useEffect(() => {
    let mounted = true;

    const checkAuth = async () => {
      try {
        const uid = await fetchUser();
        if (mounted) {
          setUserId(uid);
          setIsAuthorized(true);
        }
      } catch (err) {
        if (mounted) {
          setIsAuthorized(false);
        }
      }
    };

    checkAuth();

    return () => {
      mounted = false;
    };
  }, []);

  const fetchUser = async () => {
    const response = await api.get("/auth/me/", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      },
    });
    return response.data.id;
  };

  const handleAuthorize = async () => {
    try {
      const uid = await fetchUser();
      setUserId(uid);
      window.location.href = `https://localhost:8000/authorize?user_id=${uid}`;
    } catch (e) {
      console.error("Не удалось инициировать авторизацию", e);
      setError("Не удалось начать авторизацию Google");
    }
  };

  // Дебансированный поиск
  const debouncedSearch = useCallback(
    debounce(async (searchText) => {
      if (!searchText.trim()) {
        setResults([]);
        return;
      }

      if (!userId || isAuthorized === false) return;

      setError("");
      setLoading(true);

      try {
        const res = await api.get("/drive-search", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
          params: {
            q: searchText,
            user_id: userId,
          },
        });

        setResults(res.data.files || []);
      } catch (e) {
        if (e.response?.status === 401 && e.response.data?.need_auth) {
          setIsAuthorized(false);
          setError("Требуется авторизация в Google");
        } else {
          setError(e.message || "Что-то пошло не так...");
        }
      } finally {
        setLoading(false);
      }
    }, 500),
    [userId, isAuthorized]
  );

  const handleSearch = () => {
    debouncedSearch(query);
  };

  // Поиск по Enter
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      debouncedSearch.flush(); // сразу выполняем без ожидания debounce
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto bg-white rounded-xl shadow-sm">
      <h2 className="text-2xl font-semibold mb-5 text-gray-800">
        Поиск в Google Sheets
      </h2>

      <div className="flex gap-3 mb-5">
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            debouncedSearch(e.target.value);
          }}
          onKeyDown={handleKeyDown}
          placeholder="Название таблицы, текст внутри, владелец..."
          className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
          disabled={loading || isAuthorized === false}
        />

        <button
          onClick={handleSearch}
          disabled={loading || !query.trim() || isAuthorized === false}
          className={`
            px-6 py-3 font-medium rounded-lg transition
            ${
              loading || !query.trim() || isAuthorized === false
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
            }
          `}
        >
          {loading ? "Поиск..." : "Найти"}
        </button>
      </div>

        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-amber-800 mb-3">
            Для поиска нужно подключить ваш Google-аккаунт
          </p>
          <button
            onClick={handleAuthorize}
            className="px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition shadow-sm"
          >
            Подключить Google →
          </button>
        </div>

      {error && (
        <p className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg border border-red-200">
          {error}
        </p>
      )}

      {loading && query.trim() && (
        <div className="text-center py-8 text-gray-500">
          <div className="animate-spin inline-block w-6 h-6 border-4 border-blue-500 border-t-transparent rounded-full mb-3"></div>
          <p>Ищем таблицы...</p>
        </div>
      )}

      {!loading && results.length === 0 && query.trim() && isAuthorized !== false && (
        <div className="text-center py-10 text-gray-500">
          Ничего не найдено по запросу «{query}»
        </div>
      )}

      {!query.trim() && (
        <div className="text-center py-10 text-gray-400 italic">
          Введите запрос для поиска
        </div>
      )}

      <ul className="space-y-2">
        {results.map((file) => (
          <li key={file.id}>
            <a
              href={file.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block p-3 bg-gray-50 hover:bg-blue-50 rounded-lg border border-gray-200 transition hover:border-blue-300 group"
            >
              <div className="font-medium text-gray-800 group-hover:text-blue-700">
                {file.name}
              </div>
              {file.owner && (
                <div className="text-sm text-gray-500">
                  {file.owner}
                </div>
              )}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}