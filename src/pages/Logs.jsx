import React, {useEffect, useState, useRef} from "react";
import {
    Terminal,
    X,
    RefreshCw,
    Maximize2,
    Minimize2,
    AlertCircle,
    Trash2,
    Filter,
    Search,
    Download,
    Copy,
    Check
} from "lucide-react";
import api from "../api/axios"

export default function LogConsole() {
    const [logs, setLogs] = useState([]);
    const [filteredLogs, setFilteredLogs] = useState([]);
    const [open, setOpen] = useState(false);
    const [error, setError] = useState("");
    const [isMaximized, setIsMaximized] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [filterLevel, setFilterLevel] = useState("all");
    const [copied, setCopied] = useState(false);
    const [isRefreshing] = useState(false);
    const logRef = useRef(null);
    const [showConsole, setShowConsole] = useState(false); // ✅ добавлено

    useEffect(() => {
        const checkUser = async () => {
            try {
                const res = await api.get("/auth/me/"); // или /get_user_profile/ — в зависимости от URL
                const role = res.data.role;

                // Показываем консоль только если роль — admin
                if (role === "admin") {
                    setShowConsole(true);
                } else {
                    setShowConsole(false);
                }
            } catch (err) {
                console.warn("Не удалось проверить пользователя:", err);
                setShowConsole(false);
            }
        };
        checkUser();
    }, []);

    // 🚫 Если пользователь не "aleksej" — не показываем вообщ

    const fetchLogs = async () => {
        try {
            const res = await api.get("/logs/");
            setLogs(res.data.logs || []);
            setError("");
        } catch {
            setError("Ошибка загрузки логов");
        }
    };

    useEffect(() => {
        if (open && logRef.current) {
            logRef.current.scrollTop = logRef.current.scrollHeight;
        }
    }, [logs, open]);

    useEffect(() => {
        let filtered = logs;

        if (searchQuery) {
            filtered = filtered.filter(line =>
                line.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        if (filterLevel !== "all") {
            filtered = filtered.filter(line => {
                if (filterLevel === "error") return line.includes("ERROR") || line.includes("Traceback");
                if (filterLevel === "warning") return line.includes("WARNING");
                if (filterLevel === "info") return line.includes("INFO");
                return true;
            });
        }

        setFilteredLogs(filtered);
    }, [logs, searchQuery, filterLevel]);

    const getLogColor = (line) => {
        if (line.includes("ERROR") || line.includes("Traceback")) return "text-red-400 bg-red-950/20";
        if (line.includes("WARNING")) return "text-yellow-400 bg-yellow-950/20";
        if (line.includes("INFO")) return "text-blue-400 bg-blue-950/20";
        return "text-green-400 bg-green-950/10";
    };

    const getLogIcon = (line) => {
        if (line.includes("ERROR") || line.includes("Traceback")) return "🔴";
        if (line.includes("WARNING")) return "⚠️";
        if (line.includes("INFO")) return "ℹ️";
        return "✓";
    };

    const clearLogs = () => {
        setLogs([]);
        setFilteredLogs([]);
    };

    const copyLogs = () => {
        const text = filteredLogs.join("\n");
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const downloadLogs = () => {
        const text = filteredLogs.join("\n");
        const blob = new Blob([text], {type: "text/plain"});
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `logs-${new Date().toISOString().split('T')[0]}.txt`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const errorCount = logs.filter(line => line.includes("ERROR") || line.includes("Traceback")).length;
    const warningCount = logs.filter(line => line.includes("WARNING")).length;
    const infoCount = logs.filter(line => line.includes("INFO")).length;

    if (!showConsole) return null;

    if (!open) {
        return (
            <div className="fixed bottom-4 right-4 z-50">
                <button
                    onClick={() => setOpen(true)}
                    className="relative flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-xl shadow-2xl hover:shadow-slate-900/50 hover:scale-105 transition-all border border-slate-700 group"
                >
                    <Terminal className="w-4 h-4 text-green-400 group-hover:text-green-300"/>
                    <span className="text-sm font-bold">Console</span>
                    {errorCount > 0 && (
                        <div
                            className="absolute -top-2 -right-2 flex items-center justify-center min-w-[20px] h-5 px-1.5 bg-red-500 text-white text-xs font-bold rounded-full animate-pulse">
                            {errorCount}
                        </div>
                    )}
                </button>
            </div>
        );
    }


    return (
        <div
            className={`fixed ${
                isMaximized ? "inset-4" : "bottom-4 right-4 w-[700px] max-w-[calc(100vw-2rem)]"
            } z-50 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 rounded-2xl shadow-2xl border border-slate-700/50 flex flex-col max-h-[calc(100vh-2rem)] overflow-hidden transition-all duration-300 backdrop-blur`}
        >
            <div
                className="bg-gradient-to-r from-slate-800/80 via-slate-800/90 to-slate-900/80 px-4 py-3 flex items-center justify-between border-b border-slate-700/50 flex-shrink-0 backdrop-blur">
                <div className="flex items-center gap-3 min-w-0">
                    <div className="relative">
                        <Terminal className="w-5 h-5 text-green-400 flex-shrink-0"/>
                        <div
                            className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    </div>
                    <div className="flex flex-col min-w-0">
                        <span className="text-white font-bold text-sm truncate">Django Logs</span>
                        <div className="flex items-center gap-2 text-xs">
                            {errorCount > 0 && (
                                <span className="text-red-400 font-semibold">{errorCount} ошибки</span>
                            )}
                            {warningCount > 0 && (
                                <span className="text-yellow-400 font-semibold">{warningCount} критические</span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button
                        onClick={fetchLogs}
                        disabled={isRefreshing}
                        className="p-1.5 hover:bg-slate-700/50 rounded-lg transition-all active:scale-95 disabled:opacity-50"
                        title="Обновить"
                    >
                        <RefreshCw
                            className={`w-4 h-4 text-slate-400 hover:text-white transition-colors ${isRefreshing ? 'animate-spin' : ''}`}/>
                    </button>

                    <button
                        onClick={copyLogs}
                        className="p-1.5 hover:bg-slate-700/50 rounded-lg transition-all active:scale-95"
                        title="Копировать"
                    >
                        {copied ? (
                            <Check className="w-4 h-4 text-green-400"/>
                        ) : (
                            <Copy className="w-4 h-4 text-slate-400 hover:text-white transition-colors"/>
                        )}
                    </button>

                    <button
                        onClick={downloadLogs}
                        className="p-1.5 hover:bg-slate-700/50 rounded-lg transition-all active:scale-95"
                        title="Скачать"
                    >
                        <Download className="w-4 h-4 text-slate-400 hover:text-white transition-colors"/>
                    </button>

                    <button
                        onClick={clearLogs}
                        className="p-1.5 hover:bg-red-600/80 rounded-lg transition-all active:scale-95"
                        title="Очистить"
                    >
                        <Trash2 className="w-4 h-4 text-slate-400 hover:text-white transition-colors"/>
                    </button>

                    <div className="w-px h-6 bg-slate-700/50 mx-1"></div>

                    <button
                        onClick={() => setIsMaximized(!isMaximized)}
                        className="p-1.5 hover:bg-slate-700/50 rounded-lg transition-all active:scale-95 hidden sm:block"
                        title={isMaximized ? "Свернуть" : "Развернуть"}
                    >
                        {isMaximized ? (
                            <Minimize2 className="w-4 h-4 text-slate-400 hover:text-white transition-colors"/>
                        ) : (
                            <Maximize2 className="w-4 h-4 text-slate-400 hover:text-white transition-colors"/>
                        )}
                    </button>

                    <button
                        onClick={() => setOpen(false)}
                        className="p-1.5 hover:bg-red-600/80 rounded-lg transition-all active:scale-95"
                        title="Закрыть"
                    >
                        <X className="w-4 h-4 text-slate-400 hover:text-white transition-colors"/>
                    </button>
                </div>
            </div>

            <div
                className="flex items-center gap-2 px-4 py-2 bg-slate-900/50 border-b border-slate-700/30 flex-shrink-0">
                <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500"/>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Поиск в логах..."
                        className="w-full pl-9 pr-3 py-1.5 bg-slate-800/50 border border-slate-700/50 text-slate-200 placeholder-slate-500 rounded-lg text-xs focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30 transition-all"
                    />
                </div>

                <div className="flex items-center gap-1 bg-slate-800/50 border border-slate-700/50 rounded-lg p-0.5">
                    <button
                        onClick={() => setFilterLevel("all")}
                        className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
                            filterLevel === "all"
                                ? "bg-slate-700 text-white"
                                : "text-slate-400 hover:text-slate-300"
                        }`}
                    >
                        Все
                    </button>
                    <button
                        onClick={() => setFilterLevel("error")}
                        className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all flex items-center gap-1 ${
                            filterLevel === "error"
                                ? "bg-red-600/80 text-white"
                                : "text-slate-400 hover:text-red-400"
                        }`}
                    >
                        <span>Ошибки</span>
                        {errorCount > 0 && <span className="text-[10px] opacity-80">({errorCount})</span>}
                    </button>
                    <button
                        onClick={() => setFilterLevel("warning")}
                        className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all flex items-center gap-1 ${
                            filterLevel === "warning"
                                ? "bg-yellow-600/80 text-white"
                                : "text-slate-400 hover:text-yellow-400"
                        }`}
                    >
                        <span>Предупреждения</span>
                        {warningCount > 0 && <span className="text-[10px] opacity-80">({warningCount})</span>}
                    </button>
                    <button
                        onClick={() => setFilterLevel("info")}
                        className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all flex items-center gap-1 ${
                            filterLevel === "info"
                                ? "bg-blue-600/80 text-white"
                                : "text-slate-400 hover:text-blue-400"
                        }`}
                    >
                        <span>Инфо</span>
                        {infoCount > 0 && <span className="text-[10px] opacity-80">({infoCount})</span>}
                    </button>
                </div>
            </div>

            <div
                ref={logRef}
                className={`flex-1 overflow-y-auto bg-slate-950/50 p-3 min-h-0 ${
                    isMaximized ? "" : "max-h-96"
                }`}
            >
                {error ? (
                    <div
                        className="flex items-center gap-3 p-4 bg-red-900/20 border border-red-600/50 rounded-xl text-red-400">
                        <AlertCircle className="w-5 h-5 flex-shrink-0"/>
                        <div>
                            <div className="font-bold text-sm mb-1">Connection Error</div>
                            <div className="text-xs opacity-80">{error}</div>
                        </div>
                    </div>
                ) : filteredLogs.length === 0 && logs.length > 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-slate-500">
                        <Filter className="w-12 h-12 mb-2 opacity-50"/>
                        <span className="text-sm font-semibold">Нет логов с выбранным фильтром</span>
                        <button
                            onClick={() => {
                                setFilterLevel("all");
                                setSearchQuery("");
                            }}
                            className="mt-3 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs transition-all"
                        >
                            Сбросить фильтры
                        </button>
                    </div>
                ) : filteredLogs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-slate-500">
                        <Terminal className="w-12 h-12 mb-2 opacity-50"/>
                        <span className="text-sm font-semibold">Нет логов для отображения</span>
                        <span className="text-xs opacity-70 mt-1">Ожидание событий...</span>
                    </div>
                ) : (
                    <div className="space-y-0.5 font-mono text-[11px]">
                        {filteredLogs.map((line, i) => (
                            <div
                                key={i}
                                className={`${getLogColor(line)} leading-relaxed hover:brightness-110 px-3 py-2 rounded-lg transition-all border border-transparent hover:border-slate-700/50`}
                            >
                                <div className="flex items-start gap-2">
                                    <span className="select-none flex-shrink-0 mt-0.5">{getLogIcon(line)}</span>
                                    <span className="break-all flex-1">{line}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div
                className="bg-gradient-to-r from-slate-900/80 to-slate-800/80 px-4 py-2 border-t border-slate-700/30 flex items-center justify-between text-xs text-slate-400 flex-shrink-0 backdrop-blur">
        <span className="hidden sm:inline text-slate-500 text-[11px] font-mono">
          {filteredLogs.length}/{logs.length} logs
        </span>
            </div>
        </div>
    );
}
