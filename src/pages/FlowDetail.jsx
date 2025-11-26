import {useParams, useNavigate} from "react-router-dom";
import {useEffect, useState, useMemo} from "react";
import api from "../api/axios";
import * as XLSX from "xlsx";
import {saveAs} from "file-saver";
import {
    ArrowLeft,
    Filter,
    CheckSquare,
    Square,
    Loader2,
    Search,
    X,
    FileDown,
    DollarSign,
    AlertCircle,
    Calendar,
    FileText,
} from "lucide-react";

export default function FlowDetail() {
    const {flowId} = useParams();
    const navigate = useNavigate();
    const [flow, setFlow] = useState({serial_numbers: []});
    const [loading, setLoading] = useState(true);

    const [statusFilter, setStatusFilter] = useState("");
    const [paidFilter, setPaidFilter] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [invoiceNumberFilter, setInvoiceNumberFilter] = useState("");

    const [selectedIds, setSelectedIds] = useState([]);
    const [selectCount, setSelectCount] = useState("");

    const [bulkPaymentValue, setBulkPaymentValue] = useState("");
    const [bulkIssueDate, setBulkIssueDate] = useState("");
    const [bulkSigningDate, setBulkSigningDate] = useState("");
    const [bulkStatus, setBulkStatus] = useState("");
    const [bulkNote, setBulkNote] = useState("");
    const [applyingBulk, setApplyingBulk] = useState(false);

    useEffect(() => {
        const fetchFlow = async () => {
            try {
                const res = await api.get(`/flow_detail/${flowId}/`);
                setFlow({
                    ...res.data,
                    serial_numbers: res.data.serial_numbers || [],
                });
            } catch (err) {
                console.error("Ошибка загрузки потока:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchFlow();
    }, [flowId]);

    const filteredSerials = useMemo(() => {
        return flow.serial_numbers
            .filter((sn) => {
                let statusMatch = !statusFilter || sn.status === statusFilter;
                let paidMatch = true;
                if (paidFilter) {
                    paidMatch =
                        paidFilter === "paid"
                            ? sn.atm?.invoice_paid === true
                            : sn.atm?.invoice_paid === false;
                }
                let searchMatch =
                    !searchQuery ||
                    sn.sn?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    sn.note?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    String(sn.number).includes(searchQuery);
                let invoiceMatch =
                    !invoiceNumberFilter ||
                    sn.atm?.paint_number?.toLowerCase().includes(invoiceNumberFilter.toLowerCase());
                return statusMatch && paidMatch && searchMatch && invoiceMatch;
            })
            .sort((a, b) => (a.number || 0) - (b.number || 0));
    }, [flow.serial_numbers, statusFilter, paidFilter, searchQuery, invoiceNumberFilter]);

    const handleCheck = (id) => {
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
        );
    };

    const selectFirstN = () => {
        const n = parseInt(selectCount, 10);
        if (!n || n <= 0) return;
        const firstNIds = filteredSerials
            .sort((a, b) => a.number - b.number)
            .slice(0, n)
            .map((sn) => sn.id);
        setSelectedIds(firstNIds);
    };

    const exportToExcel = () => {
        if (selectedIds.length === 0) {
            alert("Выберите хотя бы один серийный номер");
            return;
        }

        const dataToExport = flow.serial_numbers
            .filter((sn) => selectedIds.includes(sn.id))
            .sort((a, b) => a.number - b.number)
            .map((sn) => ({
                "№": sn.number,
                "S/N": sn.sn,
                Статус: sn.status,
                "Дата выставления": sn.issue_date,
                "Дата подписания": sn.signing_date,
                "Оплата Яковлеву": sn.payment_to_yakovlev,
                "ATM статус": sn.atm?.status,
                "Номер счета": sn.atm?.paint_number,
                "Счет подписан": sn.atm?.invoice_paid ? "Да" : "Нет",
            }));

        const worksheet = XLSX.utils.json_to_sheet(dataToExport);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Поток");

        const excelBuffer = XLSX.write(workbook, {
            bookType: "xlsx",
            type: "array",
        });
        const blob = new Blob([excelBuffer], {type: "application/octet-stream"});
        saveAs(blob, `flow_${flowId}.xlsx`);
    };

    const applyBulkPayment = async () => {
        if (selectedIds.length === 0) {
            alert("Выберите хотя бы один серийный номер!");
            return;
        }
        setApplyingBulk(true);
        try {
            await api.patch("/update_payment/", {
                ids: selectedIds,
                value: bulkPaymentValue,
            });
            alert("Изменения успешно применены!");
            const res = await api.get(`/flow_detail/${flowId}/`);
            setFlow({
                ...res.data,
                serial_numbers: res.data.serial_numbers || [],
            });
            setBulkPaymentValue("");
            setSelectedIds([]);
        } catch (err) {
            console.error(err);
            alert("Ошибка при сохранении данных");
        } finally {
            setApplyingBulk(false);
        }
    };

    const applyBulkDates = async () => {
        if (selectedIds.length === 0) {
            alert("Выберите хотя бы один серийный номер!");
            return;
        }
        if (!bulkIssueDate && !bulkSigningDate) {
            alert("Укажите хотя бы одну дату!");
            return;
        }
        setApplyingBulk(true);
        try {
            await api.patch("/update_dates_flow/", {
                ids: selectedIds,
                issue_date: bulkIssueDate,
                signing_date: bulkSigningDate,
            });
            alert("Даты успешно обновлены!");
            const res = await api.get(`/flow_detail/${flowId}/`);
            setFlow({
                ...res.data,
                serial_numbers: res.data.serial_numbers || [],
            });
            setBulkIssueDate("");
            setBulkSigningDate("");
            setSelectedIds([]);
        } catch (err) {
            console.error(err);
            alert("Ошибка при сохранении данных");
        } finally {
            setApplyingBulk(false);
        }
    };

    const applyBulkStatus = async () => {
        if (selectedIds.length === 0) {
            alert("Выберите хотя бы один серийный номер!");
            return;
        }
        if (!bulkStatus) {
            alert("Укажите статус!");
            return;
        }
        setApplyingBulk(true);
        try {
            await api.patch("/update_status_flow/", {
                ids: selectedIds,
                status: bulkStatus,
            });
            alert("Статус успешно обновлен!");
            const res = await api.get(`/flow_detail/${flowId}/`);
            setFlow({
                ...res.data,
                serial_numbers: res.data.serial_numbers || [],
            });
            setBulkStatus("");
            setSelectedIds([]);
        } catch (err) {
            console.error(err);
            alert("Ошибка при сохранении данных");
        } finally {
            setApplyingBulk(false);
        }
    };

    const applyBulkNote = async () => {
        if (selectedIds.length === 0) {
            alert("Выберите хотя бы один серийный номер!");
            return;
        }
        if (!bulkNote.trim()) {
            alert("Укажите примечание!");
            return;
        }
        setApplyingBulk(true);
        try {
            await api.patch("/update_note_flow/", {
                ids: selectedIds,
                note: bulkNote,
            });
            alert("Примечание успешно добавлено!");
            const res = await api.get(`/flow_detail/${flowId}/`);
            setFlow({
                ...res.data,
                serial_numbers: res.data.serial_numbers || [],
            });
            setBulkNote("");
            setSelectedIds([]);
        } catch (err) {
            console.error(err);
            alert("Ошибка при сохранении данных");
        } finally {
            setApplyingBulk(false);
        }
    };

    const clearFilters = () => {
        setStatusFilter("");
        setPaidFilter("");
        setSearchQuery("");
        setInvoiceNumberFilter("");
    };

    const hasActiveFilters = statusFilter || paidFilter || searchQuery || invoiceNumberFilter;

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-8 h-8 text-slate-400 animate-spin"/>
                    <p className="text-slate-600 font-medium">Загрузка потока...</p>
                </div>
            </div>
        );
    }

    const statusOptions = [
        "Не поступал",
        "Получен",
        "Окрашивается",
        "Счет выставлен",
        "Оплачен",
    ];
    const allSelected =
        selectedIds.length > 0 && selectedIds.length === filteredSerials.length;
    const someSelected = selectedIds.length > 0 && !allSelected;

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => navigate(-1)}
                                className="flex items-center gap-2 px-3 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all"
                            >
                                <ArrowLeft className="w-4 h-4"/>
                                <span className="font-medium">Назад</span>
                            </button>
                            <div className="h-8 w-px bg-slate-200"></div>
                            <h1 className="text-xl font-bold text-slate-900">
                                {flow.name || "Поток"}
                            </h1>
                        </div>

                        <div className="flex items-center gap-2">
              <span className="text-sm text-slate-500">
                Всего записей: <span className="font-bold text-slate-900">{flow.serial_numbers.length}</span>
              </span>
                            <span className="text-slate-300">|</span>
                            <span className="text-sm text-slate-500">
                Отображается: <span className="font-bold text-slate-900">{filteredSerials.length}</span>
              </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 flex-wrap">
                        <div className="relative flex-1 min-w-[200px]">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"/>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Поиск по S/N, номеру акта..."
                                className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
                            />
                        </div>
                        <input
                            type="text"
                            value={invoiceNumberFilter}
                            onChange={(e) => setInvoiceNumberFilter(e.target.value)}
                            placeholder="Номер счета..."
                            className="px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all min-w-[150px]"
                        />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all"
                        >
                            <option value="">Все статусы</option>
                            {statusOptions.map((status) => (
                                <option key={status} value={status}>
                                    {status}
                                </option>
                            ))}
                        </select>

                        <select
                            value={paidFilter}
                            onChange={(e) => setPaidFilter(e.target.value)}
                            className="px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all"
                        >
                            <option value="">Все счета</option>
                            <option value="paid">Оплачено</option>
                            <option value="not_paid">Не оплачено</option>
                        </select>


                        {hasActiveFilters && (
                            <button
                                onClick={clearFilters}
                                className="flex items-center gap-1.5 px-3 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all"
                            >
                                <X className="w-4 h-4"/>
                                Сбросить
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {selectedIds.length > 0 && (
                <div className="bg-blue-50 border-b border-blue-200">
                    <div className="max-w-7xl mx-auto px-6 py-4">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <CheckSquare className="w-5 h-5 text-blue-600"/>
                                <span className="text-sm font-medium text-blue-900">
                  Выбрано: {selectedIds.length}
                </span>
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    onClick={exportToExcel}
                                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-all font-medium"
                                >
                                    <FileDown className="w-4 h-4"/>
                                    Экспорт
                                </button>

                                <button
                                    onClick={() => setSelectedIds([])}
                                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-slate-600 hover:text-slate-900 hover:bg-white rounded-lg transition-all"
                                >
                                    <X className="w-4 h-4"/>
                                    Отменить
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                            <div className="bg-white rounded-lg p-3 border border-blue-200">
                                <h3 className="text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wide">
                                    Оплата Яковлеву
                                </h3>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="text"
                                        value={bulkPaymentValue}
                                        onChange={(e) => setBulkPaymentValue(e.target.value)}
                                        placeholder="Введите сумму"
                                        className="flex-1 px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                    />
                                    <button
                                        onClick={applyBulkPayment}
                                        disabled={applyingBulk || !bulkPaymentValue.trim()}
                                        className="flex items-center gap-1.5 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium"
                                    >
                                        {applyingBulk ? (
                                            <Loader2 className="w-4 h-4 animate-spin"/>
                                        ) : (
                                            <>
                                                <DollarSign className="w-4 h-4"/>
                                                Применить
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>

                            <div className="bg-white rounded-lg p-3 border border-blue-200">
                                <h3 className="text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wide">
                                    Даты
                                </h3>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="date"
                                        value={bulkIssueDate}
                                        onChange={(e) => setBulkIssueDate(e.target.value)}
                                        className="flex-1 px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                        placeholder="Дата выставления"
                                    />
                                    <input
                                        type="date"
                                        value={bulkSigningDate}
                                        onChange={(e) => setBulkSigningDate(e.target.value)}
                                        className="flex-1 px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                        placeholder="Дата подписания"
                                    />
                                    <button
                                        onClick={applyBulkDates}
                                        disabled={applyingBulk || (!bulkIssueDate && !bulkSigningDate)}
                                        className="flex items-center gap-1.5 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium"
                                    >
                                        {applyingBulk ? (
                                            <Loader2 className="w-4 h-4 animate-spin"/>
                                        ) : (
                                            <>
                                                <Calendar className="w-4 h-4"/>
                                                Применить
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>

                            <div className="bg-white rounded-lg p-3 border border-blue-200">
                                <h3 className="text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wide">
                                    Статус
                                </h3>
                                <div className="flex items-center gap-2">
                                    <select
                                        value={bulkStatus}
                                        onChange={(e) => setBulkStatus(e.target.value)}
                                        className="flex-1 px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                    >
                                        <option value="">Выбрать статус</option>
                                        {statusOptions.map((status) => (
                                            <option key={status} value={status}>
                                                {status}
                                            </option>
                                        ))}
                                    </select>
                                    <button
                                        onClick={applyBulkStatus}
                                        disabled={applyingBulk || !bulkStatus}
                                        className="flex items-center gap-1.5 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium"
                                    >
                                        {applyingBulk ? (
                                            <Loader2 className="w-4 h-4 animate-spin"/>
                                        ) : (
                                            <>
                                                <Filter className="w-4 h-4"/>
                                                Применить
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>

                            <div className="bg-white rounded-lg p-3 border border-blue-200">
                                <h3 className="text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wide">
                                    Примечание
                                </h3>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="text"
                                        value={bulkNote}
                                        onChange={(e) => setBulkNote(e.target.value)}
                                        placeholder="Введите примечание"
                                        className="flex-1 px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                    />
                                    <button
                                        onClick={applyBulkNote}
                                        disabled={applyingBulk || !bulkNote.trim()}
                                        className="flex items-center gap-1.5 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium"
                                    >
                                        {applyingBulk ? (
                                            <Loader2 className="w-4 h-4 animate-spin"/>
                                        ) : (
                                            <>
                                                <FileText className="w-4 h-4"/>
                                                Применить
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="max-w-7xl mx-auto px-6 py-6">
                <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
                    <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <h2 className="text-sm font-semibold text-slate-700">
                                Быстрый выбор
                            </h2>
                            <input
                                type="number"
                                min="1"
                                max={filteredSerials.length}
                                value={selectCount}
                                onChange={(e) => setSelectCount(e.target.value)}
                                placeholder="Кол-во"
                                className="w-20 px-2 py-1 text-sm bg-slate-50 border border-slate-200 rounded focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all"
                            />
                            <button
                                onClick={selectFirstN}
                                disabled={!selectCount}
                                className="px-3 py-1 text-sm bg-slate-900 text-white rounded hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium"
                            >
                                Выбрать первые
                            </button>
                        </div>

                        <button
                            onClick={() => {
                                if (allSelected) {
                                    setSelectedIds([]);
                                } else {
                                    setSelectedIds(filteredSerials.map((sn) => sn.id));
                                }
                            }}
                            className="flex items-center gap-2 px-3 py-1 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded transition-all"
                        >
                            {allSelected ? (
                                <>
                                    <Square className="w-4 h-4"/>
                                    Снять все
                                </>
                            ) : (
                                <>
                                    <CheckSquare className="w-4 h-4"/>
                                    Выбрать все
                                </>
                            )}
                        </button>
                    </div>

                    {filteredSerials.length === 0 ? (
                        <div className="p-12 text-center">
                            <AlertCircle className="w-12 h-12 mx-auto mb-4 text-slate-300"/>
                            <p className="text-slate-500">
                                {hasActiveFilters
                                    ? "Нет результатов по выбранным фильтрам"
                                    : "Нет доступных записей"}
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="px-4 py-3 text-left">
                                        <input
                                            type="checkbox"
                                            checked={allSelected}
                                            ref={(el) => {
                                                if (el) el.indeterminate = someSelected;
                                            }}
                                            onChange={(e) => {
                                                if (e.target.checked)
                                                    setSelectedIds(filteredSerials.map((sn) => sn.id));
                                                else setSelectedIds([]);
                                            }}
                                            className="w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-2 focus:ring-slate-900"
                                        />
                                    </th>
                                    <th className="px-4 py-3 text-left font-semibold text-slate-700">
                                        №
                                    </th>
                                    <th className="px-4 py-3 text-left font-semibold text-slate-700">
                                        S/N
                                    </th>
                                    <th className="px-4 py-3 text-left font-semibold text-slate-700">
                                        Статус
                                    </th>
                                    <th className="px-4 py-3 text-left font-semibold text-slate-700">
                                        Примечание
                                    </th>
                                    <th className="px-4 py-3 text-left font-semibold text-slate-700">
                                        Дата выставления
                                    </th>
                                    <th className="px-4 py-3 text-left font-semibold text-slate-700">
                                        Дата подписания
                                    </th>
                                    <th className="px-4 py-3 text-left font-semibold text-slate-700">
                                        Оплата Яковлеву
                                    </th>
                                    <th className="px-4 py-3 text-left font-semibold text-slate-700">
                                        ATM статус
                                    </th>
                                    <th className="px-4 py-3 text-left font-semibold text-slate-700">
                                        Номер счета
                                    </th>
                                    <th className="px-4 py-3 text-left font-semibold text-slate-700">
                                        Счет оплачен
                                    </th>
                                    <th className="px-4 py-3 text-left font-semibold text-slate-700">
                                        Файл счета
                                    </th>
                                    <th className="px-4 py-3 text-left font-semibold text-slate-700">
                                        Файл счета (подпись)
                                    </th>
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                {filteredSerials.map((sn, idx) => (
                                    <tr
                                        key={sn.id}
                                        className={`hover:bg-slate-50 transition-colors ${
                                            selectedIds.includes(sn.id) ? "bg-blue-50" : ""
                                        }`}
                                    >
                                        <td className="px-4 py-3">
                                            <input
                                                type="checkbox"
                                                checked={selectedIds.includes(sn.id)}
                                                onChange={() => handleCheck(sn.id)}
                                                className="w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-2 focus:ring-slate-900"
                                            />
                                        </td>
                                        <td className="px-4 py-3 text-slate-900 font-medium">
                                            {sn.number || "-"}
                                        </td>
                                        <td className="px-4 py-3 text-slate-700 font-mono text-xs">
                                            {sn.sn || "-"}
                                        </td>
                                        <td className="px-4 py-3">
                        <span
                            className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-slate-100 text-slate-700">
                          {sn.status || "-"}
                        </span>
                                        </td>
                                        <td className="px-4 py-3 text-slate-700">
                                            {sn.note || "-"}
                                        </td>
                                        <td className="px-4 py-3 text-slate-700">
                                            {sn.issue_date ? new Date(sn.issue_date).toLocaleDateString('ru-RU') : "-"}
                                        </td>
                                        <td className="px-4 py-3 text-slate-700">
                                            {sn.signing_date ? new Date(sn.signing_date).toLocaleDateString('ru-RU') : "-"}
                                        </td>
                                        <td className="px-4 py-3 text-slate-700">
                                            {sn.payment_to_yakovlev || "-"}
                                        </td>
                                        <td className="px-4 py-3 text-slate-700">
                                            {sn.atm?.status || "-"}
                                        </td>
                                        <td className="px-4 py-3 text-slate-700">
                                            {sn.atm?.paint_number || "-"}
                                        </td>
                                        <td className="px-4 py-3">
                                            {sn.atm?.invoice_paid ? (
                                                <span
                                                    className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700">
                            Да
                          </span>
                                            ) : (
                                                <span
                                                    className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-amber-100 text-amber-700">
                            Нет
                          </span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-slate-700 text-xs truncate max-w-[150px]">
                                            {sn.atm?.invoice_file ? (
                                                <a
                                                    href={sn.atm.invoice_file}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-600 hover:text-blue-700 hover:underline"
                                                >
                                                    Открыть
                                                </a>
                                            ) : (
                                                "-"
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-slate-700 text-xs truncate max-w-[150px]">
                                            {sn.atm?.invoice_signature_file ? (
                                                <a
                                                    href={sn.atm.invoice_signature_file}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-600 hover:text-blue-700 hover:underline"
                                                >
                                                    Открыть
                                                </a>
                                            ) : (
                                                "-"
                                            )}
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
    );
}
