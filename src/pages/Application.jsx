import {useState} from "react"
import {FileText} from "lucide-react"
import RequestList from "../components/RequestList"

export default function ApplicationPage() {
    const [refreshCount, setRefreshCount] = useState(0)

    return (
        <div className="min-h-screen from-slate-50 via-blue-50 to-indigo-100">
            <div className="max-w-6xl mx-auto p-6 space-y-8">
                {/* Заголовок с кнопкой создания заявки */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-3xl p-8 border border-blue-100">
                    <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
                            <FileText className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">Управление заявками</h1>
                            <p className="text-gray-600">Просмотр и управление заявками на устройства</p>
                        </div>
                    </div>
                </div>

                {/* Список заявок */}
                <div>
                    <RequestList refresh={refreshCount} onRefresh={() => setRefreshCount(prev => prev + 1)} />
                </div>
            </div>
        </div>
    )
}