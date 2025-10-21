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
  Clock,
  ChevronDown,
  Archive,
  TrendingUp,
  Sparkles
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
  const [addingAtm, setAddingAtm] = useState(null);
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);

  const [searchSN, setSearchSN] = useState("");
  const [filterFrom, setFilterFrom] = useState("");
  const [filterTo, setFilterTo] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const statusOptions = [
    {
      label: "Принят на склад",
      color: "bg-slate-100 text-slate-700 border-slate-300",
      hoverColor: "hover:bg-slate-200",
      icon: Archive
    },
    {
      label: "Готов к передаче в покраску",
      color: "bg-blue-100 text-blue-700 border-blue-300",
      hoverColor: "hover:bg-blue-200",
      icon: TrendingUp
    },
    {
      label: "Готов к передаче в ПП",
      color: "bg-cyan-100 text-cyan-700 border-cyan-300",
      hoverColor: "hover:bg-cyan-200",
      icon: TrendingUp
    },
    {
      label: "Принята в ПП",
      color: "bg-amber-100 text-amber-700 border-amber-300",
      hoverColor: "hover:bg-amber-200",
      icon: Clock
    },
    {
      label: "ПП завершено",
      color: "bg-green-100 text-green-700 border-green-300",
      hoverColor: "hover:bg-green-200",
      icon: CheckCircle2
    },
    {
      label: "Отгружено",
      color: "bg-emerald-100 text-emerald-700 border-emerald-300",
      hoverColor: "hover:bg-emerald-200",
      icon: Sparkles
    }
  ];

  const getStatusConfig = (statusLabel) => {
    return statusOptions.find(opt => opt.label === statusLabel) || statusOptions[0];
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

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isStatusDropdownOpen && !event.target.closest('.status-dropdown')) {
        setIsStatusDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isStatusDropdownOpen]);

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
      setAddingAtm(atmSn);
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
    } finally {
      setAddingAtm(null);
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
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-slate-200 border-t-blue-500 rounded-full animate-spin"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-blue-400 rounded-full animate-ping opacity-20"></div>
          </div>
          <p className="text-slate-600 font-medium text-lg">Загрузка данных...</p>
        </div>
      </div>
    );
  }

  if (!requestData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 flex items-center justify-center p-4">
        <div className="bg-white/80 backdrop-blur-xl shadow-2xl rounded-3xl p-12 border border-slate-200 text-center">
          <AlertCircle className="w-16 h-16 mx-auto mb-4 text-slate-400" />
          <p className="text-slate-600 text-lg">Данные не найдены</p>
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
  const currentStatusConfig = getStatusConfig(selectedStatus);
  const StatusIcon = currentStatusConfig.icon;

  return (
    <div className="min-h-screen from-slate-50 via-blue-50 to-slate-100">
      <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-xl border-b border-slate-200 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-5">
          <div className="flex items-start gap-4 mb-5">
            <button
              onClick={() => window.history.back()}
              className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 active:scale-95 transition-all shadow-sm border border-slate-200"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="font-medium">Назад</span>
            </button>

            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2 flex-wrap">
                <h1 className="text-3xl font-bold text-slate-800">
                  Заявка №{requestData.request.number}
                </h1>
                <div className={`flex items-center gap-2 px-4 py-2 ${currentStatusConfig.color} rounded-xl shadow-sm border`}>
                  <StatusIcon className="w-4 h-4" />
                  <span className="text-sm font-bold">{requestData.request.status}</span>
                </div>
              </div>
              <div className="flex items-center gap-5 flex-wrap">
                <span className="text-sm text-slate-600 flex items-center gap-2">
                  <Package className="w-4 h-4 text-blue-500" />
                  <span className="font-medium text-slate-700">{requestData.request.project}</span>
                </span>
                <span className="text-sm text-slate-600 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-500" />
                  <span className="font-medium text-slate-700">Создана: {requestData.request.date_received}</span>
                </span>
                <span className="text-sm text-slate-600 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span className="font-medium text-slate-700">{requestData.atm_list_req.length} банкоматов</span>
                </span>
              </div>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl mb-5">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm font-medium flex-1">{error}</p>
              <button
                onClick={() => setError("")}
                className="p-1 hover:bg-red-100 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          <div className="flex items-center gap-3 flex-wrap bg-gradient-to-r from-slate-50 to-blue-50 rounded-xl p-4 border border-slate-200 shadow-sm">
            <label className="text-sm font-semibold text-slate-700">Изменить статус:</label>
            <div className="flex items-center gap-3">
              <div className="relative status-dropdown">
                <button
                  onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
                  className={`flex items-center gap-3 px-4 py-2.5 ${currentStatusConfig.color} rounded-xl border shadow-sm ${currentStatusConfig.hoverColor} transition-all font-medium min-w-[280px] justify-between`}
                >
                  <div className="flex items-center gap-2">
                    <StatusIcon className="w-5 h-5" />
                    <span>{selectedStatus}</span>
                  </div>
                  <ChevronDown className={`w-4 h-4 transition-transform ${isStatusDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {isStatusDropdownOpen && (
                  <div className="absolute top-full left-0 mt-2 w-full bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden z-30">
                    {statusOptions.map((option) => {
                      const OptionIcon = option.icon;
                      const isSelected = option.label === selectedStatus;
                      return (
                        <button
                          key={option.label}
                          onClick={() => {
                            setSelectedStatus(option.label);
                            setHasUnsavedChanges(true);
                            setIsStatusDropdownOpen(false);
                          }}
                          className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-all ${
                            isSelected
                              ? `${option.color} border-l-4`
                              : 'hover:bg-slate-50 border-l-4 border-transparent'
                          }`}
                        >
                          <OptionIcon className="w-5 h-5" />
                          <span className="font-medium">{option.label}</span>
                          {isSelected && (
                            <CheckCircle2 className="w-4 h-4 ml-auto" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <button
                onClick={handleStatusChange}
                disabled={!hasUnsavedChanges || saving}
                className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 active:scale-95 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
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
              <span className="text-xs text-amber-600 font-semibold flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 rounded-lg border border-amber-200">
                <Clock className="w-3.5 h-3.5" />
                Несохранённые изменения
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        <div className="bg-white/80 backdrop-blur-xl shadow-xl rounded-3xl border border-slate-200 overflow-hidden">
          <div className="p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-xl border border-green-200">
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                </div>
                Банкоматы с заявкой
                <span className="text-base font-normal text-slate-500 bg-slate-100 px-3 py-1 rounded-lg border border-slate-200">
                  {requestData.atm_list_req.length}
                </span>
              </h2>
            </div>

            {requestData.atm_list_req.length === 0 ? (
              <div className="text-center py-16 text-slate-500">
                <div className="p-4 bg-slate-100 rounded-2xl w-fit mx-auto mb-4">
                  <Package className="w-16 h-16 text-slate-400" />
                </div>
                <p className="text-lg font-medium">Банкоматы ещё не добавлены в заявку</p>
              </div>
            ) : (
              <div className="overflow-hidden rounded-xl border border-slate-200">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-slate-100 to-slate-50">
                      <th className="text-left p-4 text-xs font-bold text-slate-700 uppercase tracking-wider">Серийный номер</th>
                      <th className="text-left p-4 text-xs font-bold text-slate-700 uppercase tracking-wider">Дата принятия</th>
                      <th className="text-left p-4 text-xs font-bold text-slate-700 uppercase tracking-wider">Модель</th>
                      <th className="text-left p-4 text-xs font-bold text-slate-700 uppercase tracking-wider">Паллет</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white">
                    {requestData.atm_list_req.map((atm, index) => (
                      <tr
                        key={atm.sn}
                        className="border-t border-slate-100 hover:bg-slate-50 transition-colors"
                      >
                        <td className="p-4 font-semibold text-slate-800">{atm.sn}</td>
                        <td className="p-4 text-slate-600">
                          {new Date(atm.accepted_at).toLocaleDateString("ru-RU")}
                        </td>
                        <td className="p-4 text-slate-600">{atm.model}</td>
                        <td className="p-4">
                          <span className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-sm font-semibold border border-slate-200">
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

        <div className="bg-white/80 backdrop-blur-xl shadow-xl rounded-3xl border border-slate-200 overflow-hidden">
          <div className="p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-xl border border-blue-200">
                  <Package className="w-6 h-6 text-blue-600" />
                </div>
                Доступные банкоматы
                <span className="text-base font-normal text-slate-500 bg-slate-100 px-3 py-1 rounded-lg border border-slate-200">
                  {filteredAtms.length} из {requestData.atm_list_not_req.length}
                </span>
              </h2>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all shadow-sm font-semibold border ${
                  showFilters
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200'
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
              <div className="mb-5 p-5 bg-gradient-to-r from-slate-50 to-blue-50 rounded-2xl border border-slate-200">
                <div className="flex flex-wrap gap-4 items-end">
                  <div className="flex-1 min-w-[200px]">
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      Поиск по серийному номеру
                    </label>
                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        value={searchSN}
                        onChange={(e) => setSearchSN(e.target.value)}
                        placeholder="Введите серийный номер"
                        className="w-full pl-11 pr-4 py-3 border-2 border-slate-200 bg-white text-slate-700 placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-xl outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div className="flex-1 min-w-[150px]">
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      Дата от
                    </label>
                    <input
                      type="date"
                      value={filterFrom}
                      onChange={(e) => setFilterFrom(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-slate-200 bg-white text-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-xl outline-none transition-all"
                    />
                  </div>

                  <div className="flex-1 min-w-[150px]">
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      Дата до
                    </label>
                    <input
                      type="date"
                      value={filterTo}
                      onChange={(e) => setFilterTo(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-slate-200 bg-white text-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-xl outline-none transition-all"
                    />
                  </div>

                  {hasActiveFilters && (
                    <button
                      onClick={clearFilters}
                      className="px-4 py-3 bg-slate-200 text-slate-700 rounded-xl hover:bg-slate-300 transition-all font-semibold"
                    >
                      Сбросить
                    </button>
                  )}
                </div>
              </div>
            )}

            {filteredAtms.length === 0 ? (
              <div className="text-center py-16 text-slate-500">
                <div className="p-4 bg-slate-100 rounded-2xl w-fit mx-auto mb-4">
                  <Search className="w-16 h-16 text-slate-400" />
                </div>
                <p className="text-lg font-medium mb-2">
                  {hasActiveFilters ? 'Ничего не найдено' : 'Нет доступных банкоматов'}
                </p>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="mt-3 text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Сбросить фильтры
                  </button>
                )}
              </div>
            ) : (
              <div className="overflow-hidden rounded-xl border border-slate-200">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-slate-100 to-slate-50">
                      <th className="text-left p-4 text-xs font-bold text-slate-700 uppercase tracking-wider">Серийный номер</th>
                      <th className="text-left p-4 text-xs font-bold text-slate-700 uppercase tracking-wider">Дата принятия</th>
                      <th className="text-left p-4 text-xs font-bold text-slate-700 uppercase tracking-wider">Модель</th>
                      <th className="text-left p-4 text-xs font-bold text-slate-700 uppercase tracking-wider">Паллет</th>
                      <th className="text-left p-4 text-xs font-bold text-slate-700 uppercase tracking-wider">Действие</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white">
                    {filteredAtms.map((atm) => (
                      <tr
                        key={atm.sn}
                        className="border-t border-slate-100 hover:bg-slate-50 transition-colors"
                      >
                        <td className="p-4 font-semibold text-slate-800">{atm.sn}</td>
                        <td className="p-4 text-slate-600">
                          {new Date(atm.accepted_at).toLocaleDateString("ru-RU")}
                        </td>
                        <td className="p-4 text-slate-600">{atm.model}</td>
                        <td className="p-4">
                          <span className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-sm font-semibold border border-slate-200">
                            {atm.pallet}
                          </span>
                        </td>
                        <td className="p-4">
                          <button
                            onClick={() => addAtmToRequest(atm.sn)}
                            disabled={addingAtm === atm.sn}
                            className="flex items-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 active:scale-95 transition-all shadow-md font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {addingAtm === atm.sn ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Добавление...
                              </>
                            ) : (
                              <>
                                <Plus className="w-4 h-4" />
                                Добавить
                              </>
                            )}
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
