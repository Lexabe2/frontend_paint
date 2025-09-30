import {useEffect, useState} from "react"
import {Link} from "react-router-dom"
import api from "../api/axios"
import {UserCheck} from 'lucide-react';

export default function OTKSearch() {
    const [allAtms, setAllAtms] = useState([])
    const [filteredAtms, setFilteredAtms] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")
    const [query, setQuery] = useState("")

    // Загрузка всех банкоматов при монтировании
    useEffect(() => {
        const fetchAllAtms = async () => {
            setLoading(true)
            setError("")

            try {
                const res = await api.get("/atm_list/", {
                    params: {page: "otk"}
                });

                const atms = res.data.atms || []
                setAllAtms(atms)
                setFilteredAtms(atms)
            } catch (err) {
                console.error("Ошибка при загрузке:", err)
                setError("Не удалось загрузить данные. Проверьте подключение к интернету.")
            } finally {
                setLoading(false)
            }
        }

        fetchAllAtms()
    }, [])

    // Локальный поиск при изменении запроса
    useEffect(() => {
        if (!query.trim()) {
            setFilteredAtms(allAtms)
            return
        }

        const searchQuery = query.toLowerCase().trim()
        const filtered = allAtms.filter(atm =>
            atm.serial_number?.toLowerCase().includes(searchQuery) ||
            atm.pallet?.toLowerCase().includes(searchQuery) ||
            atm.model?.toLowerCase().includes(searchQuery)
        )

        setFilteredAtms(filtered)
    }, [query, allAtms])

    const handleClearSearch = () => {
        setQuery("")
    }

    const handleRetry = () => {
        window.location.reload()
    }

    const SkeletonCard = () => (
        <div className="animate-pulse bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
                <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-48"></div>
                </div>
                <div className="h-6 bg-gray-200 rounded w-16"></div>
            </div>
        </div>
    )

    const SearchIcon = () => (
        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
        </svg>
    )

    const ClearIcon = () => (
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
        </svg>
    )

    const ATMIcon = () => (
        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>
        </svg>
    )

    const PalletIcon = () => (
        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
        </svg>
    )

    return (
        <div className="min-l-screen from-gray-50 to-blue-50">
            <div className="max-w-4xl mx-auto p-6">
                {/* Header */}
                <div className="mb-8 p-6 bg-white rounded-lg shadow-md border border-gray-200">
                    <div className="flex items-center mb-4">
                        <UserCheck className="w-10 h-10 text-blue-600 mr-3"/>
                        <h1 className="text-3xl font-extrabold text-gray-900">ОТК</h1>
                    </div>
                    <p className="text-gray-600 text-lg">
                        {loading ? (
                            <span className="flex items-center">
        <svg
            className="animate-spin h-5 w-5 mr-2 text-blue-600"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
        >
          <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
          ></circle>
          <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4l-3 3 3 3h-4z"
          ></path>
        </svg>
        Загружаем список банкоматов...
      </span>
                        ) : (
                            `Найдите банкомат среди ${allAtms.length} доступных`
                        )}
                    </p>
                </div>

                {/* Search Bar */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <SearchIcon/>
                        </div>
                        <input
                            type="text"
                            placeholder="Поиск по номеру банкомата, паллете или модели..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            disabled={loading}
                            className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-lg disabled:bg-gray-50 disabled:text-gray-500"
                        />
                        {query && (
                            <button
                                onClick={handleClearSearch}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center hover:bg-gray-50 rounded-r-lg transition-colors"
                                title="Очистить поиск"
                            >
                                <ClearIcon/>
                            </button>
                        )}
                    </div>

                    {/* Search Stats */}
                    {!loading && (
                        <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
              <span>
                {query ? (
                    <>Найдено: <span
                        className="font-semibold text-gray-700">{filteredAtms.length}</span> из {allAtms.length}</>
                ) : (
                    <>Всего банкоматов: <span className="font-semibold text-gray-700">{allAtms.length}</span></>
                )}
              </span>
                            {query && (
                                <span>
                  по запросу: <span className="font-mono bg-gray-100 px-2 py-1 rounded">{query}</span>
                </span>
                            )}
                        </div>
                    )}
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-center py-4">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            <span className="ml-3 text-gray-600">Загружаем банкоматы...</span>
                        </div>
                        {[1, 2, 3, 4, 5].map((i) => (
                            <SkeletonCard key={i}/>
                        ))}
                    </div>
                )}

                {/* Error State */}
                {error && !loading && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                        <div className="text-red-600 mb-2">
                            <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor"
                                 viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"/>
                            </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-red-800 mb-2">Ошибка загрузки</h3>
                        <p className="text-red-600 mb-4">{error}</p>
                        <button
                            onClick={handleRetry}
                            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition-colors"
                        >
                            Попробовать снова
                        </button>
                    </div>
                )}

                {/* Results */}
                {!loading && !error && (
                    <div>
                        {/* Results List */}
                        {filteredAtms.length === 0 ? (
                            <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                                <div className="text-gray-400 mb-4">
                                    <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor"
                                         viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                                              d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.29-1.009-5.824-2.562M15 6.306a7.962 7.962 0 00-6 0m6 0V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2.306"/>
                                    </svg>
                                </div>
                                {query ? (
                                    <>
                                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Ничего не найдено</h3>
                                        <p className="text-gray-600 mb-4">
                                            По запросу "{query}" банкоматы не найдены.
                                        </p>
                                        <button
                                            onClick={handleClearSearch}
                                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                                        >
                                            Показать все банкоматы
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Нет данных</h3>
                                        <p className="text-gray-600">Список банкоматов пуст</p>
                                    </>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {filteredAtms.map((atm, idx) => (
                                    <div
                                        key={idx}
                                        className="bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-200 p-4"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <ATMIcon/>
                                                    <Link
                                                        to={`/otk/${atm.serial_number}`}
                                                        className="font-mono text-lg font-semibold text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                                                    >
                                                        {atm.serial_number}
                                                    </Link>
                                                    <span
                                                        className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                            {atm.model}
                          </span>
                                                </div>

                                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                                    <PalletIcon/>
                                                    <span>Паллет:</span>
                                                    {atm.pallet ? (
                                                        <Link
                                                            to={`/otk/${atm.pallet}`}
                                                            className="font-mono text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                                                        >
                                                            {atm.pallet}
                                                        </Link>
                                                    ) : (
                                                        <span className="text-gray-400 italic">Не указана</span>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex flex-col gap-2">
                                                <Link
                                                    to={`/otk/${atm.serial_number}`}
                                                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors text-center"
                                                >
                                                    Подробнее
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}