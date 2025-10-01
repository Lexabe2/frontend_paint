import React, { useState, useEffect, useRef } from "react";
import api from "../api/axios.js";
import PhotoModal from "../components/PhotoModal.jsx";

export default function AtmSearchPage() {
    const [query, setQuery] = useState("");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [isScanned, setIsScanned] = useState(false);
    const [error, setError] = useState("");
    const [toast, setToast] = useState(null);
    const [searchFocused, setSearchFocused] = useState(false);
    const [copied, setCopied] = useState(false);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [isTyping, setIsTyping] = useState(false);
    const [searchHistory, setSearchHistory] = useState([]);
    const [showHistory, setShowHistory] = useState(false);
    const [cardHovered, setCardHovered] = useState(false);
    const [buttonPressed, setButtonPressed] = useState(false);
    const [particles, setParticles] = useState([]);
    const [shake, setShake] = useState(false);
    const [pulse, setPulse] = useState(false);

    const searchInputRef = useRef(null);
    const cardRef = useRef(null);
    const typingTimeoutRef = useRef(null);

    const showToast = (text, type = "success", ms = 3000) => {
        setToast({ text, type });
        setTimeout(() => setToast(null), ms);

        // Тактильная обратная связь для PWA
        if ('vibrate' in navigator) {
            navigator.vibrate(type === 'success' ? [50] : [100, 50, 100]);
        }

        // Создаем частицы для успеха
        if (type === 'success') {
            createParticles();
        }
    };

    // Создание частиц для анимации успеха
    const createParticles = () => {
        const newParticles = Array.from({ length: 20 }, (_, i) => ({
            id: i,
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            color: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'][Math.floor(Math.random() * 4)],
            size: Math.random() * 6 + 2,
            velocity: { x: (Math.random() - 0.5) * 4, y: (Math.random() - 0.5) * 4 }
        }));
        setParticles(newParticles);
        setTimeout(() => setParticles([]), 2000);
    };

    // Отслеживание движения мыши для интерактивных эффектов
    useEffect(() => {
        const handleMouseMove = (e) => {
            setMousePosition({ x: e.clientX, y: e.clientY });
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    // Отслеживание ввода для анимации печати
    useEffect(() => {
        if (query) {
            setIsTyping(true);
            clearTimeout(typingTimeoutRef.current);
            typingTimeoutRef.current = setTimeout(() => setIsTyping(false), 500);
        }
    }, [query]);

    // Загрузка истории поиска
    useEffect(() => {
        const history = JSON.parse(localStorage.getItem('atmSearchHistory') || '[]');
        setSearchHistory(history.slice(0, 5));
    }, []);

    const searchByCode = async (atm) => {
        if (!atm || atm.trim() === "") {
            setShake(true);
            setTimeout(() => setShake(false), 500);
            showToast("Введите серийный номер или код", "error");
            return;
        }

        setLoading(true);
        setError("");
        setPulse(true);

        try {
            const res = await api.get(`/atm/search/`, { params: { code: atm } });
            setResult(res.data);
            showToast(`ATM найден: ${res.data.serial_number}`);
            setIsScanned(true);

            // Сохраняем в историю
            const history = JSON.parse(localStorage.getItem('atmSearchHistory') || '[]');
            const newHistory = [atm, ...history.filter(item => item !== atm)].slice(0, 10);
            localStorage.setItem('atmSearchHistory', JSON.stringify(newHistory));
            setSearchHistory(newHistory.slice(0, 5));

        } catch (err) {
            setResult(null);
            const msg = err.response?.data?.error || err.message || "Ошибка поиска";
            showToast(`ATM не найден: ${atm}`, "error");
            setError(msg);
            setIsScanned(false);
            setShake(true);
            setTimeout(() => setShake(false), 500);
        } finally {
            setLoading(false);
            setPulse(false);
        }
    };

    const handleSubmit = (e) => {
        e?.preventDefault();
        setButtonPressed(true);
        setTimeout(() => setButtonPressed(false), 150);
        searchByCode(query.trim());
    };

    const handleReset = () => {
        setQuery("");
        setResult(null);
        setIsScanned(false);
        setError("");
        setToast(null);
        setShowHistory(false);
        searchInputRef.current?.focus();
    };

    const handleCopy = async (text) => {
        try {
            await navigator.clipboard?.writeText(text);
            setCopied(true);
            showToast("Скопировано в буфер обмена");
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            showToast("Не удалось скопировать", "error");
        }
    };

    const handleHistorySelect = (item) => {
        setQuery(item);
        setShowHistory(false);
        searchByCode(item);
    };

    // Keyboard shortcuts for desktop
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.ctrlKey || e.metaKey) {
                if (e.key === 'k') {
                    e.preventDefault();
                    searchInputRef.current?.focus();
                }
            }
            if (e.key === 'Escape') {
                setShowHistory(false);
                searchInputRef.current?.blur();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Gesture handling for mobile
    useEffect(() => {
        let startY = 0;
        const handleTouchStart = (e) => {
            startY = e.touches[0].clientY;
        };

        const handleTouchEnd = (e) => {
            const endY = e.changedTouches[0].clientY;
            const diff = startY - endY;

            // Pull to refresh gesture
            if (diff < -100 && window.scrollY === 0) {
                window.location.reload();
            }
        };

        document.addEventListener('touchstart', handleTouchStart);
        document.addEventListener('touchend', handleTouchEnd);

        return () => {
            document.removeEventListener('touchstart', handleTouchStart);
            document.removeEventListener('touchend', handleTouchEnd);
        };
    }, []);

    // Icons with animations
    const SearchIcon = ({ className = "w-5 h-5" }) => (
        <svg className={`${className} transition-all duration-300 ${isTyping ? 'animate-pulse text-blue-500' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
    );

    const CopyIcon = () => (
        <svg className="w-4 h-4 transition-transform duration-200 group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
    );

    const CheckIcon = () => (
        <svg className="w-4 h-4 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
    );

    const RefreshIcon = () => (
        <svg className="w-4 h-4 transition-transform duration-200 group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
    );

    const ATMIcon = () => (
        <svg className="w-6 h-6 text-blue-600 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
    );

    const HistoryIcon = () => (
        <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    );

    const SparkleIcon = () => (
        <svg className="w-4 h-4 text-yellow-500 animate-spin" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
    );

    return (
        <div className="min-h-screen from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div
                    className="absolute w-96 h-96 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-3xl transition-all duration-1000 ease-out"
                    style={{
                        left: mousePosition.x - 192,
                        top: mousePosition.y - 192,
                        transform: `scale(${cardHovered ? 1.2 : 1})`
                    }}
                />
                <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-gradient-to-r from-pink-400/20 to-yellow-400/20 rounded-full blur-2xl animate-pulse" />
                <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-gradient-to-r from-green-400/20 to-blue-400/20 rounded-full blur-3xl animate-bounce" style={{ animationDuration: '3s' }} />
            </div>

            {/* Floating Particles */}
            {particles.map(particle => (
                <div
                    key={particle.id}
                    className="absolute rounded-full animate-ping pointer-events-none"
                    style={{
                        left: particle.x,
                        top: particle.y,
                        width: particle.size,
                        height: particle.size,
                        backgroundColor: particle.color,
                        animationDuration: '2s'
                    }}
                />
            ))}

            <div className="max-w-6xl mx-auto p-4 pb-20 lg:pb-8 relative z-10">

                {/* Floating Header */}
                <div className="mb-8">
                    <div className={`bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-6 lg:p-8 transition-all duration-500 ${pulse ? 'animate-pulse' : ''}`}>
                        <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 lg:w-16 lg:h-16 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg transform transition-transform duration-300 hover:scale-110 hover:rotate-3">
                                <SearchIcon className="w-6 h-6 lg:w-8 lg:h-8 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                                    Поиск банкомата
                                </h1>
                                <p className="text-gray-600 text-sm lg:text-base">
                                    Найдите информацию о банкомате по серийному номеру
                                </p>
                                <div className="hidden lg:block mt-2">
                                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full animate-pulse">
                                        Ctrl+K для быстрого поиска • Потяните вниз для обновления
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Enhanced Search Section */}
                <div className="mb-8">
                    <div className={`bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-6 lg:p-8 transition-all duration-300 ${shake ? 'animate-bounce' : ''}`}>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <SearchIcon />
                                </div>
                                <input
                                    ref={searchInputRef}
                                    type="text"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    onFocus={() => {
                                        setSearchFocused(true);
                                        setShowHistory(searchHistory.length > 0);
                                    }}
                                    onBlur={() => {
                                        setTimeout(() => {
                                            setSearchFocused(false);
                                            setShowHistory(false);
                                        }, 200);
                                    }}
                                    placeholder="Введите серийный номер или код банкомата..."
                                    className={`block w-full pl-12 pr-4 py-4 lg:py-5 border-2 rounded-2xl transition-all duration-300 text-lg font-medium placeholder-gray-400 ${
                                        searchFocused 
                                            ? 'border-blue-500 bg-white shadow-lg ring-4 ring-blue-500/20 scale-105' 
                                            : 'border-gray-200 bg-gray-50/50 hover:bg-white hover:border-gray-300 hover:scale-102'
                                    } ${shake ? 'animate-shake' : ''}`}
                                    aria-label="search-atm"
                                />

                                {/* Search History Dropdown */}
                                {showHistory && searchHistory.length > 0 && (
                                    <div className="absolute top-full left-0 right-0 mt-2 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 overflow-hidden z-50 animate-in slide-in-from-top-2 duration-300">
                                        <div className="p-3 border-b border-gray-100">
                                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                                                <HistoryIcon />
                                                <span className="font-medium">Недавние поиски</span>
                                            </div>
                                        </div>
                                        {searchHistory.map((item, index) => (
                                            <button
                                                key={index}
                                                onClick={() => handleHistorySelect(item)}
                                                className="w-full text-left px-4 py-3 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200 border-b border-gray-50 last:border-b-0 group"
                                            >
                                                <div className="flex items-center space-x-3">
                                                    <div className="w-8 h-8 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center group-hover:from-blue-100 group-hover:to-indigo-100 transition-all duration-200">
                                                        <span className="text-xs font-mono font-bold text-gray-600 group-hover:text-blue-600">
                                                            {item.slice(0, 2)}
                                                        </span>
                                                    </div>
                                                    <span className="font-mono text-gray-900 group-hover:text-blue-900">{item}</span>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="flex flex-col sm:flex-row gap-3">
                                <button
                                    type="submit"
                                    disabled={loading || !query.trim()}
                                    className={`flex-1 sm:flex-none bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 disabled:from-gray-400 disabled:to-gray-500 text-white px-8 py-4 rounded-2xl transition-all duration-300 font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none disabled:hover:scale-100 flex items-center justify-center space-x-2 ${
                                        buttonPressed ? 'scale-95' : ''
                                    }`}
                                >
                                    {loading ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            <span>Поиск...</span>
                                        </>
                                    ) : (
                                        <>
                                            <SearchIcon />
                                            <span>Найти банкомат</span>
                                            <SparkleIcon />
                                        </>
                                    )}
                                </button>

                                {isScanned && (
                                    <button
                                        type="button"
                                        onClick={handleReset}
                                        className="group bg-white hover:bg-gray-50 text-gray-700 border-2 border-gray-200 hover:border-gray-300 px-6 py-4 rounded-2xl transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center space-x-2"
                                    >
                                        <RefreshIcon />
                                        <span>Новый поиск</span>
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>
                </div>

                {/* Enhanced Toast Notification */}
                {toast && (
                    <div className="fixed top-4 left-4 right-4 lg:left-auto lg:right-8 lg:w-96 z-50 animate-in slide-in-from-top-2 duration-300">
                        <div className={`p-4 rounded-2xl shadow-2xl border backdrop-blur-xl transform transition-all duration-300 hover:scale-105 ${
                            toast.type === "success" 
                                ? "bg-green-50/90 text-green-800 border-green-200 animate-pulse" 
                                : "bg-red-50/90 text-red-800 border-red-200 animate-bounce"
                        }`}>
                            <div className="flex items-center space-x-3">
                                {toast.type === "success" ? <CheckIcon /> : <SearchIcon />}
                                <span className="font-medium">{toast.text}</span>
                                {toast.type === "success" && <SparkleIcon />}
                            </div>
                        </div>
                    </div>
                )}

                {/* Enhanced Error State */}
                {error && !result && (
                    <div className="mb-8">
                        <div className="bg-red-50/80 backdrop-blur-xl border-2 border-red-200 rounded-3xl p-6 lg:p-8 shadow-xl animate-in slide-in-from-left-2 duration-500">
                            <div className="flex items-center space-x-4">
                                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center animate-bounce">
                                    <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-red-800">Банкомат не найден</h3>
                                    <p className="text-red-600">{error}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Ultra Enhanced Result Card */}
                {result && (
                    <div className="mb-8">
                        <div
                            ref={cardRef}
                            className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden transform transition-all duration-500 hover:scale-105 animate-in slide-in-from-bottom-4"
                            onMouseEnter={() => setCardHovered(true)}
                            onMouseLeave={() => setCardHovered(false)}
                        >
                            {/* Animated Header */}
                            <div className="bg-gradient-to-r from-blue-500 to-indigo-500 p-6 lg:p-8 text-white relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/50 to-purple-600/50 animate-pulse"></div>
                                <div className="relative z-10">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-4">
                                            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm transform transition-transform duration-300 hover:rotate-12 hover:scale-110">
                                                <ATMIcon />
                                            </div>
                                            <div>
                                                <h2 className="text-2xl lg:text-3xl font-bold animate-in slide-in-from-left-2 duration-700">{result.model || "Модель не указана"}</h2>
                                                <div className="flex items-center space-x-2 mt-2">
                                                    <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-medium backdrop-blur-sm animate-pulse">
                                                        {result.status || "Статус не указан"}
                                                    </span>
                                                    <div className="flex space-x-1">
                                                        {[0, 1, 2].map((i) => (
                                                            <SparkleIcon key={i} />
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Enhanced Content */}
                            <div className="p-6 lg:p-8">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
                                    <div className="space-y-4">
                                        <div className="group flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl hover:from-blue-50 hover:to-indigo-50 transition-all duration-300 transform hover:scale-105">
                                            <div>
                                                <span className="text-gray-500 text-sm font-medium">Серийный номер</span>
                                                <p className="font-mono text-lg font-bold text-gray-900 group-hover:text-blue-900 transition-colors duration-300">{result.serial_number}</p>
                                            </div>
                                            <button
                                                onClick={() => handleCopy(result.serial_number)}
                                                className={`group p-3 rounded-xl transition-all duration-300 transform hover:scale-110 ${
                                                    copied 
                                                        ? 'bg-green-100 text-green-600 animate-bounce' 
                                                        : 'bg-blue-100 text-blue-600 hover:bg-blue-200 hover:rotate-12'
                                                }`}
                                                title="Скопировать серийный номер"
                                            >
                                                {copied ? <CheckIcon /> : <CopyIcon />}
                                            </button>
                                        </div>

                                        <div className="p-4 bg-gradient-to-r from-gray-50 to-purple-50 rounded-2xl hover:from-purple-50 hover:to-pink-50 transition-all duration-300 transform hover:scale-105">
                                            <span className="text-gray-500 text-sm font-medium">Паллета</span>
                                            <p className="font-semibold text-gray-900">{result.pallet || "Не указана"}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="p-4 bg-gradient-to-r from-gray-50 to-green-50 rounded-2xl hover:from-green-50 hover:to-emerald-50 transition-all duration-300 transform hover:scale-105">
                                            <span className="text-gray-500 text-sm font-medium">Дата принятия</span>
                                            <p className="font-semibold text-gray-900">{result.accepted_at || "Не указана"}</p>
                                        </div>

                                        <div className="flex space-x-3">
                                            <PhotoModal atmId={query} />
                                            <button
                                                onClick={() => handleCopy(JSON.stringify(result, null, 2))}
                                                className="group flex-1 bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-700 px-4 py-3 rounded-xl transition-all duration-300 font-medium text-sm flex items-center justify-center space-x-2 transform hover:scale-105"
                                            >
                                                <CopyIcon />
                                                <span>Копировать данные</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Enhanced Status History */}
                {result?.status_history && result.status_history.length > 0 && (
                    <div className="mb-8">
                        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-6 lg:p-8 animate-in slide-in-from-right-2 duration-700">
                            <div className="flex items-center space-x-3 mb-6">
                                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg transform transition-transform duration-300 hover:scale-110 hover:rotate-12">
                                    <HistoryIcon />
                                </div>
                                <h3 className="text-xl lg:text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                                    История статусов
                                </h3>
                            </div>

                            <div className="space-y-4">
                                {result.status_history.map((item, idx) => (
                                    <div key={idx} className="group p-4 lg:p-6 bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-2xl hover:shadow-lg transition-all duration-300 transform hover:scale-105 animate-in slide-in-from-left-2" style={{ animationDelay: `${idx * 100}ms` }}>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div className="transform transition-transform duration-300 group-hover:scale-105">
                                                <span className="text-gray-500 text-sm font-medium">Статус</span>
                                                <p className="font-bold text-gray-900 group-hover:text-blue-900 transition-colors duration-300">{item.status}</p>
                                            </div>
                                            <div className="transform transition-transform duration-300 group-hover:scale-105">
                                                <span className="text-gray-500 text-sm font-medium">Пользователь</span>
                                                <p className="font-semibold text-gray-900 group-hover:text-purple-900 transition-colors duration-300">{item.user || "Не указан"}</p>
                                            </div>
                                            <div className="transform transition-transform duration-300 group-hover:scale-105">
                                                <span className="text-gray-500 text-sm font-medium">Дата</span>
                                                <p className="font-semibold text-gray-900 group-hover:text-green-900 transition-colors duration-300">{item.date}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Enhanced Empty State */}
                {!result && !loading && !error && (
                    <div className="text-center py-16">
                        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-12 transform transition-all duration-500 hover:scale-105 animate-in fade-in-0 duration-1000">
                            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center transform transition-transform duration-300 hover:scale-110 hover:rotate-12">
                                <SearchIcon className="w-12 h-12 text-gray-500" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-3 animate-in slide-in-from-bottom-2 duration-700">Начните поиск</h3>
                            <p className="text-gray-600 text-lg mb-6 animate-in slide-in-from-bottom-2 duration-700" style={{ animationDelay: '200ms' }}>Введите серийный номер банкомата для получения информации</p>
                            <div className="flex justify-center space-x-1 animate-in slide-in-from-bottom-2 duration-700" style={{ animationDelay: '400ms' }}>
                                {[0, 1, 2].map((i) => (
                                    <SparkleIcon key={i} />
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Custom CSS for additional animations */}
            <style jsx>{`
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-5px); }
                    75% { transform: translateX(5px); }
                }
                .animate-shake {
                    animation: shake 0.5s ease-in-out;
                }
                .hover\\:scale-102:hover {
                    transform: scale(1.02);
                }
                .animate-in {
                    animation-fill-mode: both;
                }
                .slide-in-from-top-2 {
                    animation: slideInFromTop 0.3s ease-out;
                }
                .slide-in-from-bottom-4 {
                    animation: slideInFromBottom 0.5s ease-out;
                }
                .slide-in-from-left-2 {
                    animation: slideInFromLeft 0.3s ease-out;
                }
                .slide-in-from-right-2 {
                    animation: slideInFromRight 0.3s ease-out;
                }
                .fade-in-0 {
                    animation: fadeIn 1s ease-out;
                }
                @keyframes slideInFromTop {
                    from { transform: translateY(-20px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                @keyframes slideInFromBottom {
                    from { transform: translateY(20px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                @keyframes slideInFromLeft {
                    from { transform: translateX(-20px); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes slideInFromRight {
                    from { transform: translateX(20px); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
            `}</style>
        </div>
    );
}