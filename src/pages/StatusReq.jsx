import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  Filter,
  Loader2,
  Package,
  Plus,
  Save,
  Search,
  X,
  AlertCircle,
  CheckCircle2,
  Clock
} from "lucide-react";
import api from "../api/axios";

export default function StatusReq() {
  const { id } = useParams();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [requestData, setRequestData] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const [searchSN, setSearchSN] = useState("");
  const [filterFrom, setFilterFrom] = useState("");
  const [filterTo, setFilterTo] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const statusOptions = [
    "Принят на склад",
    "Готов к передаче в покраску",
    "Готов к передаче в ПП",
    "Принята в ПП",
    "ПП завершено",
    "Отгружено"
  ];

  const getStatusColor = (status) => {
    const colors = {
      "Принят на склад": "bg-slate-100 text-slate-700",
      "Готов к передаче в покраску": "bg-blue-100 text-blue-700",
      "Готов к передаче в ПП": "bg-cyan-100 text-cyan-700",
      "Принята в ПП": "bg-amber-100 text-amber-700",
      "ПП завершено": "bg-green-100 text-green-700",
      "Отгружено": "bg-emerald-100 text-emerald-700"
    };
    return colors[status] || "bg-gray-100 text-gray-700";
  };

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await api.get("/status_req/", {
        params: { id },
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          "Content-Type": "application/json",
        },
      });
      setRequestData(res.data);
      setSelectedStatus(res.data.request.status);
      setHasUnsavedChanges(false);
    } catch (err) {
      console.error("Ошибка при загрузке заявок:", err);
      setError("Не удалось загрузить данные");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleStatusChange = async () => {
    try {
      setSaving(true);
      setError("");
      await api.patch(
        `/status_req/`,
        { status: selectedStatus },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            "Content-Type": "application/json",
          },
          params: { id },
        }
      );

      setRequestData((prev) => ({
        ...prev,
        request: { ...prev.request, status: selectedStatus }
      }));

      setHasUnsavedChanges(false);
    } catch (err) {
      console.error("Ошибка при обновлении статуса:", err);
      setError("Не удалось обновить статус");
    } finally {
      setSaving(false);
    }
  };

  const addAtmToRequest = async (atmSn) => {
    try {
      await api.patch(`/changes_req_atm/`, { sn: atmSn }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          "Content-Type": "application/json",
        },
        params: { id },
      });
      setRequestData((prev) => {
        const atmToMove = prev.atm_list_not_req.find(a => a.sn === atmSn);
        return {
          ...prev,
          atm_list_req: [...prev.atm_list_req, atmToMove],
          atm_list_not_req: prev.atm_list_not_req.filter(a => a.sn !== atmSn)
        };
      });
    } catch (err) {
      console.error("Ошибка при добавлении банкомата:", err);
      setError("Не удалось добавить банкомат в заявку");
    }
  };

  const clearFilters = () => {
    setSearchSN("");
    setFilterFrom("");
    setFilterTo("");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          <p className="text-slate-600 font-medium">Загрузка данных...</p>
        </div>
      </div>
    );
  }

  if (!requestData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 flex items-center justify-center">
        <div className="bg-white/80 backdrop-blur shadow-lg rounded-2xl p-12 border border-slate-200 text-center">
          <AlertCircle className="w-16 h-16 mx-auto mb-4 text-slate-300" />
          <p className="text-slate-500 text-lg">Данные не найдены</p>
        </div>
      </div>
    );
  }

  const filteredAtms = requestData.atm_list_not_req.filter(atm => {
    const matchesSN = atm.sn.toLowerCase().includes(searchSN.toLowerCase());
    const atmDate = new Date(atm.accepted_at);
    const fromDate = filterFrom ? new Date(filterFrom) : null;
    const toDate = filterTo ? new Date(filterTo) : null;
    const matchesDate =
      (!fromDate || atmDate >= fromDate) &&
      (!toDate || atmDate <= toDate);
    return matchesSN && matchesDate;
  });

  const hasActiveFilters = searchSN || filterFrom || filterTo;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => window.history.back()}
              className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 active:scale-95 transition-all shadow-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="font-medium">Назад</span>
            </button>

            <div className="flex-1">
              <h1 className="text-2xl font-bold text-slate-800">
                Заявка №{requestData.request.number}
              </h1>
              <div className="flex items-center gap-4 mt-1 flex-wrap">
                <span className="text-sm text-slate-600 flex items-center gap-1">
                  <Package className="w-4 h-4" />
                  {requestData.request.project}
                </span>
                <span className="text-sm text-slate-600 flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Создана: {requestData.request.date_received}
                </span>
              </div>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-100 border border-red-200 text-red-700 rounded-lg mb-4">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm font-medium">{error}</p>
              <button
                onClick={() => setError("")}
                className="ml-auto p-1 hover:bg-red-200 rounded transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          <div className="flex items-center gap-3 flex-wrap">
            <label className="text-sm font-semibold text-slate-700">Статус заявки:</label>
            <div className="flex items-center gap-2">
              <select
                value={selectedStatus}
                onChange={(e) => {
                  setSelectedStatus(e.target.value);
                  setHasUnsavedChanges(true);
                }}
                className="border-2 border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg px-4 py-2 outline-none transition-all bg-white font-medium"
              >
                {statusOptions.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <button
                onClick={handleStatusChange}
                disabled={!hasUnsavedChanges || saving}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 active:scale-95 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Сохранение...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Сохранить
                  </>
                )}
              </button>
            </div>
            {hasUnsavedChanges && !saving && (
              <span className="text-xs text-amber-600 font-medium flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Несохранённые изменения
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        <div className="bg-white/80 backdrop-blur shadow-lg rounded-2xl border border-slate-200 overflow-hidden">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                Банкоматы с заявкой
                <span className="text-sm font-normal text-slate-500">
                  ({requestData.atm_list_req.length})
                </span>
              </h2>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(requestData.request.status)}`}>
                {requestData.request.status}
              </span>
            </div>

            {requestData.atm_list_req.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                <Package className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                <p>Банкоматы ещё не добавлены в заявку</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-slate-200">
                      <th className="text-left p-3 text-sm font-semibold text-slate-700">Серийный номер</th>
                      <th className="text-left p-3 text-sm font-semibold text-slate-700">Дата принятия</th>
                      <th className="text-left p-3 text-sm font-semibold text-slate-700">Модель</th>
                      <th className="text-left p-3 text-sm font-semibold text-slate-700">Паллет</th>
                    </tr>
                  </thead>
                  <tbody>
                    {requestData.atm_list_req.map((atm, index) => (
                      <tr
                        key={atm.sn}
                        className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                      >
                        <td className="p-3 font-medium text-slate-800">{atm.sn}</td>
                        <td className="p-3 text-slate-600">
                          {new Date(atm.accepted_at).toLocaleDateString("ru-RU")}
                        </td>
                        <td className="p-3 text-slate-600">{atm.model}</td>
                        <td className="p-3">
                          <span className="px-2 py-1 bg-slate-100 text-slate-700 rounded text-sm font-medium">
                            {atm.pallet}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur shadow-lg rounded-2xl border border-slate-200 overflow-hidden">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <Package className="w-5 h-5 text-blue-600" />
                Банкоматы без заявки
                <span className="text-sm font-normal text-slate-500">
                  ({filteredAtms.length} из {requestData.atm_list_not_req.length})
                </span>
              </h2>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all shadow-sm ${
                  showFilters
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <Filter className="w-4 h-4" />
                Фильтры
                {hasActiveFilters && (
                  <span className="bg-white text-blue-600 rounded-full px-2 py-0.5 text-xs font-bold">
                    {[searchSN, filterFrom, filterTo].filter(Boolean).length}
                  </span>
                )}
              </button>
            </div>

            {showFilters && (
              <div className="mb-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex flex-wrap gap-4 items-end">
                  <div className="flex-1 min-w-[200px]">
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Поиск по серийному номеру
                    </label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        value={searchSN}
                        onChange={(e) => setSearchSN(e.target.value)}
                        placeholder="Введите серийный номер"
                        className="w-full pl-10 pr-4 py-2 border-2 border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div className="flex-1 min-w-[150px]">
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Дата от
                    </label>
                    <input
                      type="date"
                      value={filterFrom}
                      onChange={(e) => setFilterFrom(e.target.value)}
                      className="w-full px-4 py-2 border-2 border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg outline-none transition-all"
                    />
                  </div>

                  <div className="flex-1 min-w-[150px]">
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Дата до
                    </label>
                    <input
                      type="date"
                      value={filterTo}
                      onChange={(e) => setFilterTo(e.target.value)}
                      className="w-full px-4 py-2 border-2 border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg outline-none transition-all"
                    />
                  </div>

                  {hasActiveFilters && (
                    <button
                      onClick={clearFilters}
                      className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-all font-medium"
                    >
                      Сбросить
                    </button>
                  )}
                </div>
              </div>
            )}

            {filteredAtms.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                <Search className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                <p className="font-medium">
                  {hasActiveFilters ? 'Ничего не найдено' : 'Нет доступных банкоматов'}
                </p>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="mt-3 text-blue-600 hover:underline text-sm"
                  >
                    Сбросить фильтры
                  </button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-slate-200">
                      <th className="text-left p-3 text-sm font-semibold text-slate-700">Серийный номер</th>
                      <th className="text-left p-3 text-sm font-semibold text-slate-700">Дата принятия</th>
                      <th className="text-left p-3 text-sm font-semibold text-slate-700">Модель</th>
                      <th className="text-left p-3 text-sm font-semibold text-slate-700">Паллет</th>
                      <th className="text-left p-3 text-sm font-semibold text-slate-700">Действие</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAtms.map((atm) => (
                      <tr
                        key={atm.sn}
                        className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                      >
                        <td className="p-3 font-medium text-slate-800">{atm.sn}</td>
                        <td className="p-3 text-slate-600">
                          {new Date(atm.accepted_at).toLocaleDateString("ru-RU")}
                        </td>
                        <td className="p-3 text-slate-600">{atm.model}</td>
                        <td className="p-3">
                          <span className="px-2 py-1 bg-slate-100 text-slate-700 rounded text-sm font-medium">
                            {atm.pallet}
                          </span>
                        </td>
                        <td className="p-3">
                          <button
                            onClick={() => addAtmToRequest(atm.sn)}
                            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 active:scale-95 transition-all shadow-md font-medium"
                          >
                            <Plus className="w-4 h-4" />
                            Добавить
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
