import {FileText, Activity} from "lucide-react"
import CreatedRequestsTable from "../components/CreatedRequestsTable"
import {useSearchParams} from "react-router-dom";

export default function Registration() {

    const [params] = useSearchParams();
    const group = params.get("group");

    const title = group === "warehouse" ? "Передача в покраску" : "Приемка в покраску";
    const status = group === "warehouse" ? "Заявка принята(покрасочная)" : "Готова к передачи в покраску";

    return (
        <div className="min-h-screen from-slate-50 via-blue-50/30 to-indigo-100/50 relative overflow-hidden">
            {/* Background decorative elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div
                    className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/10 to-purple-600/10 rounded-full blur-3xl"></div>
                <div
                    className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-indigo-400/10 to-cyan-600/10 rounded-full blur-3xl"></div>
                <div
                    className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-purple-400/5 to-pink-600/5 rounded-full blur-3xl"></div>
            </div>

            <div className="relative max-w-7xl mx-auto p-6 space-y-8">
                {/* Заголовок с описанием */}
                <div
                    className="relative bg-white/70 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-xl shadow-blue-500/10">
                    <div
                        className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-indigo-500/5 rounded-3xl"></div>
                    <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                        <div className="flex items-center space-x-6">
                            <div className="relative">
                                <div
                                    className="w-20 h-20 bg-gradient-to-br from-blue-500 via-purple-600 to-indigo-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-blue-500/25">
                                    <FileText className="w-10 h-10 text-white"/>
                                </div>
                                <div
                                    className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                                    <Activity className="w-3 h-3 text-white"/>
                                </div>
                            </div>
                            <div>
                                <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent mb-3">
                                    {title}
                                </h1>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Основной контент с таблицей */}
                <div
                    className="relative bg-white/80 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl shadow-blue-500/10 overflow-hidden">
                    <div
                        className="absolute inset-0 bg-gradient-to-r from-blue-500/3 via-purple-500/3 to-indigo-500/3"></div>
                    <div
                        className="relative bg-gradient-to-r from-gray-50/80 via-blue-50/50 to-purple-50/30 backdrop-blur-sm px-4 sm:px-8 py-4 sm:py-6 border-b border-white/20">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div className="flex items-center space-x-3 sm:space-x-4">
                                <div
                                    className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/25">
                                    <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-white"/>
                                </div>
                                <div>
                                    <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-gray-900 to-blue-800 bg-clip-text text-transparent">
                                        Список заявок
                                    </h2>
                                    <p className="text-sm sm:text-base text-gray-600 font-medium">Заявки готовые к
                                        обработке</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="relative p-4 sm:p-8">
                        <CreatedRequestsTable status={status}/>
                    </div>
                </div>
            </div>
        </div>
    )
}