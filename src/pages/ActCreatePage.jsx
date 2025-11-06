import React, { useState, useEffect } from "react";
import {
  FileText,
  Download,
  Upload,
  Plus,
  Calendar,
  MessageSquare,
  RefreshCw,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Package,
  CheckSquare,
  Square,
  ChevronDown,
  ChevronRight
} from "lucide-react";
import api from "../api/axios";

export default function ActPage() {
  const [acts, setActs] = useState([]);
  const [atms, setAtms] = useState([]);
  const [date, setDate] = useState("");
  const [comment, setComment] = useState("");
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [lastInvoice, setLastInvoice] = useState("");
  const [expandedGroups, setExpandedGroups] = useState({});
  const [isFormExpanded, setIsFormExpanded] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = () => {
    setInitialLoading(true);
    api
      .get("/atm_act/")
      .then((res) => {
        setActs(res.data.invoices || []);
        setAtms(res.data.atms || []);
        setLastInvoice(res.data.last_invoice);
      })
      .catch(() => {
        setMessage("Ошибка загрузки данных");
        setMessageType("error");
      })
      .finally(() => setInitialLoading(false));
  };

  const handleUploadSignature = async (e, actId) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file_signature", file);

    try {
      await api.post(`/acts/${actId}/upload-signature/`, formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setMessage("Файл успешно загружен");
      setMessageType("success");
      fetchData();
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      console.error("Ошибка при загрузке:", error);
      setMessage("Не удалось загрузить файл");
      setMessageType("error");
      setTimeout(() => setMessage(""), 3000);
    }
  };

  const handleSelect = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!date || selected.length === 0) {
      setMessage("Заполните дату и выберите банкоматы");
      setMessageType("error");
      setTimeout(() => setMessage(""), 3000);
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      await api.post("/atm_act/", {
        number: lastInvoice,
        date,
        comment,
        atms: selected,
      });

      setMessage("Акт успешно создан");
      setMessageType("success");
      setDate("");
      setComment("");
      setSelected([]);
      fetchData();
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      console.error(error);
      setMessage(
        error.response?.data?.detail ||
          error.response?.data?.error ||
          "Не удалось создать акт"
      );
      setMessageType("error");
      setTimeout(() => setMessage(""), 5000);
    } finally {
      setLoading(false);
    }
  };

  const toggleGroup = (groupName) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [groupName]: !prev[groupName],
    }));
  };

  const groupedAtms = atms.reduce((groups, atm) => {
    const key = atm.request || "Без заявки";
    if (!groups[key]) groups[key] = [];
    groups[key].push(atm);
    return groups;
  }, {});

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/20 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-100 border-t-blue-500 rounded-full animate-spin"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-blue-400 rounded-full animate-ping opacity-20"></div>
          </div>
          <p className="text-slate-700 font-semibold text-lg">Загрузка актов...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/20">
      <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-xl border-b border-blue-100 shadow-lg">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-800 truncate">
                Акты выполненных работ
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 flex items-center gap-2 mt-1">
                <FileText className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                <span className="truncate">
                  Всего актов: <span className="font-bold text-slate-800">{acts.length}</span>
                </span>
              </p>
            </div>
            <button
              onClick={fetchData}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl hover:from-blue-600 hover:to-indigo-600 active:scale-95 transition-all shadow-lg font-semibold text-sm whitespace-nowrap"
            >
              <RefreshCw className="w-4 h-4" />
              <span className="hidden sm:inline">Обновить</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 space-y-6">
        {message && (
          <div
            className={`p-4 rounded-xl border-2 flex items-center gap-3 shadow-md ${
              messageType === "success"
                ? "bg-green-50 border-green-300 text-green-800"
                : "bg-red-50 border-red-300 text-red-800"
            }`}
          >
            {messageType === "success" ? (
              <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
            )}
            <span className="font-semibold text-sm sm:text-base">{message}</span>
          </div>
        )}

        <div className="bg-white shadow-2xl rounded-2xl sm:rounded-3xl border-2 border-blue-100 overflow-hidden transition-all">
          <button
            type="button"
            onClick={() => setIsFormExpanded(!isFormExpanded)}
            className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 p-4 sm:p-6 transition-all group"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-xl group-hover:bg-white/30 transition-all">
                  <Plus className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                Создать новый акт
              </h2>
              <div className="flex items-center gap-3">
                {!isFormExpanded && selected.length > 0 && (
                  <span className="px-3 py-1.5 bg-white/20 rounded-full text-white text-xs sm:text-sm font-bold">
                    {selected.length} выбрано
                  </span>
                )}
                <div className="p-2 bg-white/20 rounded-xl group-hover:bg-white/30 transition-all">
                  {isFormExpanded ? (
                    <ChevronDown className="w-5 h-5 text-white" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-white" />
                  )}
                </div>
              </div>
            </div>
          </button>

          {isFormExpanded && (
            <form onSubmit={handleSubmit} className="p-4 space-y-3 bg-gradient-to-br from-blue-50/50 to-indigo-50/30">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Номер акта
                  </label>
                  <input
                    type="text"
                    value={lastInvoice}
                    readOnly
                    className="w-full px-3 py-2 border-2 border-blue-200 bg-blue-50/50 text-slate-700 rounded-lg outline-none font-semibold text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Дата <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400" />
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      required
                      className="w-full pl-9 pr-3 py-2 border-2 border-blue-200 bg-white text-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-lg outline-none transition-all text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Комментарий
                  </label>
                  <div className="relative">
                    <MessageSquare className="absolute left-2.5 top-2.5 w-4 h-4 text-blue-400" />
                    <input
                      type="text"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Добавить комментарий..."
                      className="w-full pl-9 pr-3 py-2 border-2 border-blue-200 bg-white text-slate-700 placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-lg outline-none transition-all text-sm"
                    />
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-700">
                    Выберите банкоматы <span className="text-red-500">*</span>
                  </label>
                  {selected.length > 0 && (
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">
                      {selected.length} выбрано
                    </span>
                  )}
                </div>

                <div className="border-2 border-blue-200 rounded-lg bg-white overflow-hidden">
                  {atms.length === 0 ? (
                    <div className="p-4 text-center">
                      <Package className="w-8 h-8 text-slate-300 mx-auto mb-1" />
                      <p className="text-slate-500 text-xs">Нет доступных банкоматов</p>
                    </div>
                  ) : (
                    <div className="max-h-64 overflow-y-auto">
                      {Object.entries(groupedAtms).map(([requestName, atmGroup]) => {
                        const isExpanded = expandedGroups[requestName] ?? true;
                        const allSelected = atmGroup.every((a) => selected.includes(a.id));
                        const someSelected = atmGroup.some((a) => selected.includes(a.id));
                        const paintShop = atmGroup[0]?.paint || "—";

                        return (
                          <div key={requestName} className="border-b border-blue-100 last:border-b-0">
                            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-3 py-2 flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => toggleGroup(requestName)}
                                className="flex items-center gap-1.5 flex-1 text-left hover:text-blue-600 transition-colors"
                              >
                                {isExpanded ? (
                                  <ChevronDown className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                                ) : (
                                  <ChevronRight className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                                )}
                                <span className="font-bold text-slate-800 text-xs truncate">
                                  {requestName}
                                </span>
                                  {paintShop && (
                                    <span className="text-xs text-emerald-600 ml-2">
                                      {paintShop}
                                    </span>
                                  )}
                                <span className="text-xs text-slate-500 flex-shrink-0">
                                  ({atmGroup.filter(a => selected.includes(a.id)).length}/{atmGroup.length})
                                </span>
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  if (allSelected) {
                                    setSelected((prev) =>
                                      prev.filter((id) => !atmGroup.some((a) => a.id === id))
                                    );
                                  } else {
                                    setSelected((prev) => [
                                      ...new Set([...prev, ...atmGroup.map((a) => a.id)]),
                                    ]);
                                  }
                                }}
                                className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-semibold transition-all ${
                                  allSelected
                                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                                    : someSelected
                                    ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                                    : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-300'
                                }`}
                              >
                                {allSelected ? (
                                  <CheckSquare className="w-3 h-3" />
                                ) : (
                                  <Square className="w-3 h-3" />
                                )}
                              </button>
                            </div>

                            {isExpanded && (
                              <div className="px-3 py-1.5 space-y-0.5 bg-white">
                                {atmGroup.map((atm) => (
                                  <label
                                    key={atm.id}
                                    className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-blue-50 cursor-pointer transition-all group"
                                  >
                                    <input
                                      type="checkbox"
                                      checked={selected.includes(atm.id)}
                                      onChange={() => handleSelect(atm.id)}
                                      className="w-3.5 h-3.5 accent-blue-600 cursor-pointer flex-shrink-0"
                                    />
                                    <div className="flex-1 min-w-0">
                                      <span className="font-semibold text-slate-800 text-xs group-hover:text-blue-600 transition-colors">
                                        {atm.serial_number}
                                      </span>
                                      <span className="text-xs text-slate-400 ml-1.5">{atm.model}</span>
                                    </div>
                                  </label>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !date || selected.length === 0}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:from-green-600 hover:to-emerald-600 active:scale-95 transition-all shadow-md font-bold disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Создание...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    Создать акт
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        <div className="bg-white shadow-2xl rounded-2xl sm:rounded-3xl border-2 border-blue-100 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 to-indigo-500 p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-xl">
                <FileText className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              Список актов
            </h2>
          </div>

          <div className="overflow-x-auto">
            {acts.length === 0 ? (
              <div className="p-8 sm:p-12 text-center">
                <div className="p-3 sm:p-4 bg-blue-50 rounded-2xl w-fit mx-auto mb-3 sm:mb-4">
                  <FileText className="w-12 h-12 sm:w-16 sm:h-16 text-blue-400" />
                </div>
                <p className="text-base sm:text-lg font-medium text-slate-500">
                  Нет актов для отображения
                </p>
              </div>
            ) : (
              <div className="hidden md:block">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b-2 border-blue-200">
                      <th className="text-left p-4 text-xs font-bold text-blue-900 uppercase tracking-wider">
                        Номер
                      </th>
                      <th className="text-left p-4 text-xs font-bold text-blue-900 uppercase tracking-wider">
                        Дата
                      </th>
                      <th className="text-left p-4 text-xs font-bold text-blue-900 uppercase tracking-wider">
                        Комментарий
                      </th>
                      <th className="text-left p-4 text-xs font-bold text-blue-900 uppercase tracking-wider">
                        Акт
                      </th>
                      <th className="text-left p-4 text-xs font-bold text-blue-900 uppercase tracking-wider">
                        Акт (подписанный)
                      </th>
                      <th className="text-left p-4 text-xs font-bold text-blue-900 uppercase tracking-wider">
                        Банкоматов
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white">
                    {acts.map((act, index) => (
                      <tr
                        key={act.id}
                        className="border-t border-blue-50 hover:bg-blue-50/50 transition-colors"
                      >
                        <td className="p-4">
                          <div className="font-semibold text-slate-800">{act.number}</div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <Calendar className="w-4 h-4 text-blue-500" />
                            {act.created_at}
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="text-slate-600 text-sm">{act.comment || "—"}</span>
                        </td>
                        <td className="p-4">
                          {act.file ? (
                            <a
                              href={act.file}
                              download
                              className="inline-flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl hover:from-blue-600 hover:to-indigo-600 active:scale-95 transition-all shadow-md font-semibold text-sm"
                            >
                              <Download className="w-4 h-4" />
                              Скачать
                            </a>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </td>
                        <td className="p-4">
                          {act.file_signature ? (
                            <a
                              href={act.file_signature}
                              download
                              className="inline-flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:from-green-600 hover:to-emerald-600 active:scale-95 transition-all shadow-md font-semibold text-sm"
                            >
                              <Download className="w-4 h-4" />
                              Скачать
                            </a>
                          ) : (
                            <label className="inline-flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl hover:from-orange-600 hover:to-amber-600 active:scale-95 transition-all shadow-md font-semibold text-sm cursor-pointer">
                              <Upload className="w-4 h-4" />
                              Загрузить
                              <input
                                type="file"
                                accept=".pdf"
                                className="hidden"
                                onChange={(e) => handleUploadSignature(e, act.id)}
                              />
                            </label>
                          )}
                        </td>
                        <td className="p-4">
                          <span className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-sm font-semibold border-2 border-blue-200">
                            {act.atm_count || act.atms?.length || 0}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="md:hidden space-y-3 p-3">
              {acts.map((act) => (
                <div
                  key={act.id}
                  className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border-2 border-blue-200 shadow-sm"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-slate-800 text-lg">{act.number}</div>
                      <span className="px-2.5 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-semibold border border-blue-200">
                        {act.atm_count || act.atms?.length || 0} ATM
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <div className="text-xs text-slate-500 font-medium mb-1">Дата</div>
                        <div className="flex items-center gap-1.5 text-slate-700">
                          <Calendar className="w-3.5 h-3.5 text-blue-500" />
                          <span className="font-semibold text-xs">{act.created_at}</span>
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500 font-medium mb-1">Комментарий</div>
                        <div className="text-slate-700 font-semibold text-xs truncate">
                          {act.comment || "—"}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2 border-t border-blue-200">
                      {act.file ? (
                        <a
                          href={act.file}
                          download
                          className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl hover:from-blue-600 hover:to-indigo-600 active:scale-95 transition-all shadow-md font-semibold text-sm"
                        >
                          <Download className="w-4 h-4" />
                          Акт
                        </a>
                      ) : (
                        <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">
                          Нет файла
                        </div>
                      )}

                      {act.file_signature ? (
                        <a
                          href={act.file_signature}
                          download
                          className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:from-green-600 hover:to-emerald-600 active:scale-95 transition-all shadow-md font-semibold text-sm"
                        >
                          <Download className="w-4 h-4" />
                          Подписанный
                        </a>
                      ) : (
                        <label className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl hover:from-orange-600 hover:to-amber-600 active:scale-95 transition-all shadow-md font-semibold text-sm cursor-pointer">
                          <Upload className="w-4 h-4" />
                          Загрузить
                          <input
                            type="file"
                            accept=".pdf"
                            className="hidden"
                            onChange={(e) => handleUploadSignature(e, act.id)}
                          />
                        </label>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
