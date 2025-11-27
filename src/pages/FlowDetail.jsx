import {useParams, useNavigate} from "react-router-dom";
import {useEffect, useState, useMemo} from "react";
import api from "../api/axios";
import * as XLSX from "xlsx";
import {saveAs} from "file-saver";
import LoadingSpinner from "../components/LoadingSpinner";
import {Menu} from "lucide-react";
import {
    ArrowLeft,
    CheckSquare,
    Square,
    Search,
    X,
    FileDown,
    AlertCircle,
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
    const [showMobileFilters, setShowMobileFilters] = useState(false);

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
                "Дата выставления": sn.issue_date ? sn.issue_date.split('-').reverse().join('.') : "",
                "Дата подписания": sn.signing_date ? sn.signing_date.split('-').reverse().join('.') : "",
                "Оплата Яковлеву": sn.payment_to_yakovlev,
                "ATM статус": sn.atm?.status,
                "Номер счета": sn.atm?.paint_number,
                "Счет оплачен": sn.atm?.invoice_paid ? "Да" : "Нет",
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
            await api.patch("/bulk_update_flow/", {
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
            await api.patch("/bulk_update_flow/", {
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
            await api.patch("/bulk_update_flow/", {
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
            await api.patch("/bulk_update_flow/", {
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
        return <LoadingSpinner message="Загрузка потока..."/>;
    }

    const statusOptions = [
        "Не поступал",
        "Получен",
        "Окрашивается",
        "Счет выставлен",
        "Ожидает оплаты",
        "Оплачен",
    ];
    const allSelected =
        selectedIds.length > 0 && selectedIds.length === filteredSerials.length;
    const someSelected = selectedIds.length > 0 && !allSelected;

    return (
        <div className="pb-safe-bottom">
            <div className="bg-white border-b border-slate-200 sticky top-0 z-20 safe-top">
                <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 md:py-4">
                    <div className="flex items-center justify-between mb-3 md:mb-4">
                        <div className="flex items-center gap-2 md:gap-4">
                            <button
                                onClick={() => navigate(-1)}
                                className="flex items-center gap-2 p-2 md:px-3 md:py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all"
                            >
                                <ArrowLeft className="w-4 h-4"/>
                                <span className="hidden md:inline font-medium">Назад</span>
                            </button>
                            <div className="hidden md:block h-8 w-px bg-slate-200"></div>
                            <h1 className="text-base md:text-xl font-bold text-slate-900 truncate max-w-[200px] md:max-w-none">
                                {flow.name || "Поток"}
                            </h1>
                        </div>

                        <div className="flex items-center gap-2 text-xs md:text-sm">
                            <button
                                onClick={() => setShowMobileFilters(!showMobileFilters)}
                                className="md:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
                            >
                                <Menu className="w-5 h-5"/>
                            </button>
                            <div className="hidden md:flex items-center gap-2">
                <span className="text-slate-500">
                  Всего: <span className="font-bold text-slate-900">{flow.serial_numbers.length}</span>
                </span>
                                <span className="text-slate-300">|</span>
                                <span className="text-slate-500">
                  Показано: <span className="font-bold text-slate-900">{filteredSerials.length}</span>
                </span>
                            </div>
                        </div>
                    </div>

                    <div
                        className={`${showMobileFilters ? 'flex' : 'hidden md:flex'} flex-col md:flex-row items-stretch md:items-center gap-2 md:gap-3`}>
                        <div className="relative flex-1 min-w-full md:min-w-[200px]">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"/>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Поиск по S/N, примечанию..."
                                className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
                            />
                        </div>

                        <input
                            type="text"
                            value={invoiceNumberFilter}
                            onChange={(e) => setInvoiceNumberFilter(e.target.value)}
                            placeholder="Номер счета..."
                            className="w-full md:w-auto px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all md:min-w-[150px]"
                        />

                        {/* Статус */}
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="h-10 px-4 pr-10 text-sm font-medium text-slate-700 bg-white border-2 border-slate-300 rounded-xl
                                     focus:outline-none focus:border-slate-900 focus:ring-4 focus:ring-slate-900/10
                                     hover:border-slate-400 transition-all cursor-pointer appearance-none
                                     bg-[url('data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2216%22 height=%2216%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%236b7280%22 stroke-width=%222%22 stroke-linecap=%22round%22 stroke-linejoin=%22round%22%3E%3Cpath d=%22M6 9l6 6 6-6%22/%3E%3C/svg%3E')]
                                     bg-no-repeat bg-[center_right_1rem]"
                        >
                            <option value="">Все статусы</option>
                            {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>

                        <select
                            value={paidFilter}
                            onChange={(e) => setPaidFilter(e.target.value)}
                            className="h-10 px-4 pr-10 text-sm font-medium text-slate-700 bg-white border-2 border-slate-300 rounded-xl
                                     focus:outline-none focus:border-slate-900 focus:ring-4 focus:ring-slate-900/10
                                     hover:border-slate-400 transition-all cursor-pointer appearance-none
                                     bg-[url('data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2216%22 height=%2216%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%236b7280%22 stroke-width=%222%22 stroke-linecap=%22round%22 stroke-linejoin=%22round%22%3E%3Cpath d=%22M6 9l6 6 6-6%22/%3E%3C/svg%3E')]
                                     bg-no-repeat bg-[center_right_1rem]"
                        >
                            <option value="">Все счета</option>
                            <option value="paid">Оплачено</option>
                            <option value="not_paid">Не оплачено</option>
                        </select>

                        {hasActiveFilters && (
                            <button
                                onClick={clearFilters}
                                className="flex items-center justify-center gap-1.5 w-full md:w-auto px-3 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all"
                            >
                                <X className="w-4 h-4"/>
                                Сбросить
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {selectedIds.length > 0 && (
                <div className="bg-slate-50/50 border-t border-slate-200">
                    <div className="max-w-7xl mx-auto px-3 py-3">
                        {/* Заголовок */}
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <CheckSquare className="w-5 h-5 text-blue-600"/>
                                <span className="text-sm font-semibold text-slate-800">
      Выбрано: {selectedIds.length}
    </span>
                            </div>

                            <div className="flex items-center gap-2">
                                {/* Экспорт — видно только на sm+ (мобильный не захламляем) */}
                                <button
                                    onClick={exportToExcel}
                                    className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 hover:bg-white rounded-lg transition-all"
                                >
                                    <FileDown className="w-4 h-4"/>
                                    Экспорт
                                </button>

                                <button
                                    onClick={() => setSelectedIds([])}
                                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 hover:bg-white rounded-lg transition-all"
                                >
                                    <X className="w-4 h-4"/>
                                    Отменить
                                </button>
                            </div>
                        </div>

                        {/* Действия */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                            {/* Оплата */}
                            <div className="flex items-center gap-2">
                                <input
                                    type="text"
                                    value={bulkPaymentValue}
                                    onChange={e => setBulkPaymentValue(e.target.value)}
                                    placeholder="Яковлев"
                                    className="flex-1 h-9 px-3 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <button
                                    onClick={applyBulkPayment}
                                    disabled={!bulkPaymentValue.trim() || applyingBulk}
                                    className="h-9 px-3 text-xs font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-all"
                                >
                                    OK
                                </button>
                            </div>

                            {/* Даты */}
                            <div className="flex items-center gap-2">
                                <input type="date" value={bulkIssueDate}
                                       onChange={e => setBulkIssueDate(e.target.value)}
                                       className="flex-1 h-9 px-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                                <input type="date" value={bulkSigningDate}
                                       onChange={e => setBulkSigningDate(e.target.value)}
                                       className="flex-1 h-9 px-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                                <button
                                    onClick={applyBulkDates}
                                    disabled={(!bulkIssueDate && !bulkSigningDate) || applyingBulk}
                                    className="h-9 w-14 text-xs font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-all"
                                >
                                    OK
                                </button>
                            </div>

                            {/* Статус */}
                            <div className="flex items-center gap-2">
                                <select
                                    value={bulkStatus}
                                    onChange={e => setBulkStatus(e.target.value)}
                                    className="flex-1 h-9 px-3 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">Статус</option>
                                    {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                                <button
                                    onClick={applyBulkStatus}
                                    disabled={!bulkStatus || applyingBulk}
                                    className="h-9 px-3 text-xs font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-all"
                                >
                                    OK
                                </button>
                            </div>

                            {/* Примечание */}
                            <div className="flex items-center gap-2">
                                <input
                                    type="text"
                                    value={bulkNote}
                                    onChange={e => setBulkNote(e.target.value)}
                                    placeholder="Заметка"
                                    className="flex-1 h-9 px-3 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <button
                                    onClick={applyBulkNote}
                                    disabled={!bulkNote.trim() || applyingBulk}
                                    className="h-9 px-3 text-xs font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-all"
                                >
                                    OK
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 md:py-6">
                <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                    <div
                        className="px-3 md:px-4 py-2 md:py-3 border-b border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 flex-1">
                            <h2 className="text-xs md:text-sm font-semibold text-slate-700 whitespace-nowrap">
                                Быстрый выбор
                            </h2>
                            <div className="flex items-center gap-2">
                                <input
                                    type="number"
                                    min="1"
                                    max={filteredSerials.length}
                                    value={selectCount}
                                    onChange={(e) => setSelectCount(e.target.value)}
                                    placeholder="Кол-во"
                                    className="flex-1 sm:flex-none sm:w-25 px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all"
                                />
                                <button
                                    onClick={selectFirstN}
                                    disabled={!selectCount}
                                    className="flex-1 sm:flex-none px-4 py-2 text-sm bg-slate-900 text-white rounded-lg hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium whitespace-nowrap"
                                >
                                    Выбрать первые
                                </button>
                            </div>
                        </div>

                        <button
                            onClick={() => {
                                if (allSelected) {
                                    setSelectedIds([]);
                                } else {
                                    setSelectedIds(filteredSerials.map((sn) => sn.id));
                                }
                            }}
                            className="flex items-center justify-center gap-2 px-4 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-all font-medium"
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
                        <div className="p-8 md:p-12 text-center">
                            <AlertCircle className="w-10 h-10 md:w-12 md:h-12 mx-auto mb-3 md:mb-4 text-slate-300"/>
                            <p className="text-sm md:text-base text-slate-500">
                                {hasActiveFilters
                                    ? "Нет результатов по выбранным фильтрам"
                                    : "Нет доступных записей"}
                            </p>
                        </div>
                    ) : (
                        <>
                            <div className="hidden md:block overflow-x-auto max-h-[600px] relative">
                                <table className="w-full text-sm">
                                    <thead className="bg-slate-50 border-b border-slate-200 sticky top-0 z-10">
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
                                                {sn.issue_date ? sn.issue_date.split('-').reverse().join('.') : "-"}
                                            </td>
                                            <td className="px-4 py-3 text-slate-700">
                                                {sn.signing_date ? sn.signing_date.split('-').reverse().join('.') : "-"}
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

                            <div className="md:hidden divide-y divide-slate-100">
                                {filteredSerials.map((sn) => (
                                    <div
                                        key={sn.id}
                                        className={`p-4 ${selectedIds.includes(sn.id) ? "bg-blue-50" : ""}`}
                                    >
                                        <div className="flex items-start gap-3 mb-3">
                                            <input
                                                type="checkbox"
                                                checked={selectedIds.includes(sn.id)}
                                                onChange={() => handleCheck(sn.id)}
                                                className="mt-1 w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-2 focus:ring-slate-900"
                                            />
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span
                                                        className="text-lg font-bold text-slate-900">#{sn.number}</span>
                                                    <span
                                                        className="inline-flex px-2 py-0.5 text-xs font-medium rounded-full bg-slate-100 text-slate-700">
                          {sn.status || "-"}
                        </span>
                                                </div>
                                                <div className="text-xs font-mono text-slate-600 mb-3 break-all">
                                                    {sn.sn || "-"}
                                                </div>

                                                <div className="space-y-2 text-sm">
                                                    {sn.act_number && (
                                                        <div className="flex items-start">
                                                            <span
                                                                className="text-slate-500 min-w-[100px]">Номер акта:</span>
                                                            <span
                                                                className="text-slate-900 font-medium">{sn.act_number}</span>
                                                        </div>
                                                    )}
                                                    {sn.issue_date && (
                                                        <div className="flex items-start">
                                                            <span
                                                                className="text-slate-500 min-w-[100px]">Выставлен:</span>
                                                            <span className="text-slate-900">{sn.issue_date}</span>
                                                        </div>
                                                    )}
                                                    {sn.signing_date && (
                                                        <div className="flex items-start">
                                                            <span
                                                                className="text-slate-500 min-w-[100px]">Подписан:</span>
                                                            <span className="text-slate-900">{sn.signing_date}</span>
                                                        </div>
                                                    )}
                                                    {sn.payment_to_yakovlev && (
                                                        <div className="flex items-start">
                                                            <span
                                                                className="text-slate-500 min-w-[100px]">Оплата:</span>
                                                            <span
                                                                className="text-slate-900 font-medium">{sn.payment_to_yakovlev}</span>
                                                        </div>
                                                    )}
                                                    {sn.atm?.model && (
                                                        <div className="flex items-start">
                                                            <span
                                                                className="text-slate-500 min-w-[100px]">Модель:</span>
                                                            <span className="text-slate-900">{sn.atm.model}</span>
                                                        </div>
                                                    )}
                                                    {sn.atm?.status && (
                                                        <div className="flex items-start">
                                                            <span
                                                                className="text-slate-500 min-w-[100px]">ATM статус:</span>
                                                            <span className="text-slate-900">{sn.atm.status}</span>
                                                        </div>
                                                    )}
                                                    {sn.atm?.paint_number && (
                                                        <div className="flex items-start">
                                                            <span
                                                                className="text-slate-500 min-w-[100px]">Номер счета:</span>
                                                            <span
                                                                className="text-slate-900">{sn.atm.paint_number}</span>
                                                        </div>
                                                    )}
                                                    <div className="flex items-start">
                                                        <span
                                                            className="text-slate-500 min-w-[100px]">Счет оплачен:</span>
                                                        {sn.atm?.invoice_paid ? (
                                                            <span
                                                                className="inline-flex px-2 py-0.5 text-xs font-medium rounded-full bg-green-100 text-green-700">
                              Да
                            </span>
                                                        ) : (
                                                            <span
                                                                className="inline-flex px-2 py-0.5 text-xs font-medium rounded-full bg-amber-100 text-amber-700">
                              Нет
                            </span>
                                                        )}
                                                    </div>
                                                    {(sn.atm?.invoice_file || sn.atm?.invoice_signature_file) && (
                                                        <div className="flex gap-2 pt-2">
                                                            {sn.atm?.invoice_file && (
                                                                <a
                                                                    href={sn.atm.invoice_file}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="flex-1 px-3 py-1.5 text-xs text-center bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-all font-medium"
                                                                >
                                                                    Файл счета
                                                                </a>
                                                            )}
                                                            {sn.atm?.invoice_signature_file && (
                                                                <a
                                                                    href={sn.atm.invoice_signature_file}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="flex-1 px-3 py-1.5 text-xs text-center bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-all font-medium"
                                                                >
                                                                    С подписью
                                                                </a>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
