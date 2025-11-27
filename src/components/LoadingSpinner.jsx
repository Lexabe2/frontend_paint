export default function LoadingSpinner({ message = "Загрузка..." }) {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      {/* Если у тебя шапка фиксированная — просто убери pt-16 или подстрой под свою высоту */}
      <div className="pt-20 pb-10 px-4">
        <div className="flex flex-col items-center gap-6">
          {/* Классический, но очень красивый спиннер */}
          <div className="relative w-14 h-14">
            <div className="absolute inset-0 rounded-full border-4 border-slate-200"></div>
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-600 animate-spin"></div>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3 bg-blue-600 rounded-full animate-spin [animation-duration:1.5s]"></div>
          </div>

          <div className="flex flex-col items-center gap-4">
            <p className="text-lg font-medium text-slate-700 tracking-wide">
              {message}
            </p>
            <div className="flex gap-2">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"
                  style={{ animationDelay: `${i * 150}ms` }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}