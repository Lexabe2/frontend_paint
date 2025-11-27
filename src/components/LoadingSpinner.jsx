export default function LoadingSpinner({ message = "Загрузка..." }) {
  return (
    <div className="fixed inset-0 bg-white flex items-center justify-center z-50">
      <div className="flex flex-col items-center gap-6">
        {/* Главный спиннер — минималистичный и элегантный */}
        <div className="relative w-14 h-14">
          {/* Внешнее кольцо (плавно вращается) */}
          <div className="absolute inset-0 rounded-full border-4 border-slate-100"></div>

          {/* Синяя дуга (главная анимация) */}
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-600 animate-spin"></div>

          {/* Точка на конце дуги */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3 bg-blue-600 rounded-full animate-spin [animation-duration:1.5s]"></div>
        </div>

        {/* Текст + точки */}
        <div className="flex flex-col items-center gap-4">
          <p className="text-lg font-medium text-slate-700 tracking-wide">
            {message}
          </p>

          <div className="flex gap-1.5">
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
  );
}