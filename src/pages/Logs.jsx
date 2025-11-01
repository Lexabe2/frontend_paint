import React, {useEffect, useState, useRef} from "react";
import {Terminal, X, RefreshCw, Maximize2, Minimize2, AlertCircle} from "lucide-react";
import api from "../api/axios";


export default function LogConsole() {
    const [logs, setLogs] = useState([]);
    const [open, setOpen] = useState(false);
    const [error, setError] = useState("");
    const [autoRefresh, setAutoRefresh] = useState(true);
    const [isMaximized, setIsMaximized] = useState(false);
    const logRef = useRef(null);

    const fetchLogs = async () => {
        try {
            const res = await api.get("/logs/");
            setLogs(res.data.logs || []);
            setError("");
        } catch (err) {
            setError("Ошибка загрузки логов");
        }
    };

    useEffect(() => {
        if (open && logRef.current) {
            logRef.current.scrollTop = logRef.current.scrollHeight;
        }
    }, [logs, open]);

    const getLogColor = (line) => {
        if (line.includes("ERROR") || line.includes("Traceback")) return "text-red-400";
        if (line.includes("WARNING")) return "text-yellow-400";
        if (line.includes("INFO")) return "text-blue-400";
        return "text-green-400";
    };

    const getLogIcon = (line) => {
        if (line.includes("ERROR") || line.includes("Traceback")) return "🔴";
        if (line.includes("WARNING")) return "🟡";
        if (line.includes("INFO")) return "🔵";
        return "🟢";
    };

    if (!open) {
        return (
            <div className="fixed bottom-4 right-4 z-50">
                <button
                    onClick={() => setOpen(true)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white rounded-xl shadow-2xl hover:bg-slate-800 transition-all border border-slate-700 group"
                >
                    <Terminal className="w-4 h-4 group-hover:animate-pulse"/>
                    <span className="text-sm font-semibold">Console</span>
                    {logs.some(line => line.includes("ERROR")) && (
                        <span className="w-2 h-2 bg-red-500 rounded-full animate-ping absolute -top-1 -right-1"></span>
                    )}
                </button>
            </div>
        );
    }

    return (
        <div
            className={`fixed ${
                isMaximized ? "inset-4" : "bottom-4 right-4 w-[600px] max-w-[calc(100vw-2rem)]"
            } z-50 bg-slate-900 rounded-xl shadow-2xl border border-slate-700 flex flex-col max-h-[calc(100vh-2rem)] overflow-hidden transition-all duration-300`}
        >
            <div
                className="bg-gradient-to-r from-slate-800 to-slate-900 px-4 py-3 flex items-center justify-between border-b border-slate-700 flex-shrink-0">
                <div className="flex items-center gap-2 min-w-0">
                    <Terminal className="w-4 h-4 text-green-400 flex-shrink-0"/>
                    <span className="text-white font-bold text-sm truncate">Django Logs Console</span>
                    {logs.length > 0 && (
                        <span
                            className="px-2 py-0.5 bg-slate-700 text-slate-300 rounded-full text-xs font-semibold flex-shrink-0">
              {logs.length}
            </span>
                    )}
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">

                    <button
                        onClick={fetchLogs}
                        className="p-1.5 hover:bg-slate-700 rounded-lg transition-all active:scale-95"
                        title="Обновить"
                    >
                        <RefreshCw className="w-4 h-4 text-slate-400 hover:text-white transition-colors"/>
                    </button>

                    <button
                        onClick={() => setIsMaximized(!isMaximized)}
                        className="p-1.5 hover:bg-slate-700 rounded-lg transition-all active:scale-95 hidden sm:block"
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
                        className="p-1.5 hover:bg-red-600 rounded-lg transition-all active:scale-95"
                        title="Закрыть"
                    >
                        <X className="w-4 h-4 text-slate-400 hover:text-white transition-colors"/>
                    </button>
                </div>
            </div>

            <div
                ref={logRef}
                className={`flex-1 overflow-y-auto bg-slate-950 p-3 min-h-0 ${
                    isMaximized ? "" : "max-h-96"
                }`}
            >
                {error ? (
                    <div
                        className="flex items-center gap-2 p-3 bg-red-900/20 border border-red-600 rounded-lg text-red-400">
                        <AlertCircle className="w-4 h-4 flex-shrink-0"/>
                        <span className="text-sm font-semibold">{error}</span>
                    </div>
                ) : logs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-slate-500">
                        <Terminal className="w-12 h-12 mb-2 opacity-50"/>
                        <span className="text-sm">Нет логов для отображения</span>
                    </div>
                ) : (
                    <div className="space-y-1 font-mono text-xs">
                        {logs.map((line, i) => (
                            <div
                                key={i}
                                className={`${getLogColor(line)} leading-relaxed hover:bg-slate-800/50 px-2 py-1 rounded transition-colors`}
                            >
                                <span className="mr-2 select-none">{getLogIcon(line)}</span>
                                <span className="break-all">{line}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div
                className="bg-slate-800 px-4 py-2 border-t border-slate-700 flex items-center justify-between text-xs text-slate-400 flex-shrink-0">
                <span className="hidden sm:inline truncate ml-2">
          {logs.length > 0 && `Обновлено: ${new Date().toLocaleTimeString()}`}
        </span>
            </div>
        </div>
    );
}
