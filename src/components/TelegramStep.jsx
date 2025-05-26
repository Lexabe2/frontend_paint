"use client"
import React from 'react';
import { useState, useRef, useEffect } from "react"
import { MessageSquare, ArrowRight, ExternalLink, Loader2 } from "lucide-react"

export default function TelegramStep({ telegramId, setTelegramId, onSubmit }) {
  const [isLoading, setIsLoading] = useState(false)
  const [activeStep, setActiveStep] = useState(0)
  const inputRef = useRef(null)

  // Автофокус на поле ввода при загрузке
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [])

  // Имитация отправки формы с загрузкой
  const handleSubmit = async () => {
    if (!telegramId.trim()) return

    setIsLoading(true)

    // Имитация задержки запроса
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      onSubmit()
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div className="text-center">
        <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <MessageSquare className="w-8 h-8 text-purple-500" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Подключение Telegram</h2>
        <p className="text-gray-600">Для двухфакторной аутентификации подключите ваш Telegram аккаунт</p>
      </div>

      {/* Поле ввода */}
      <div className="relative">
        <label className="block text-sm font-medium text-gray-700 mb-2">Telegram ID</label>
        <div className="relative rounded-lg border border-gray-300 focus-within:border-purple-500 focus-within:ring-2 focus-within:ring-purple-500">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MessageSquare className="h-5 w-5 text-gray-400" />
          </div>
          <input
            ref={inputRef}
            className="block w-full pl-10 pr-3 py-3 border-0 rounded-lg focus:outline-none focus:ring-0 bg-transparent"
            placeholder="Введите ваш Telegram ID"
            value={telegramId}
            onChange={(e) => setTelegramId(e.target.value)}
            disabled={isLoading}
          />
        </div>
        <p className="mt-1 text-xs text-gray-500">Например: 123456789</p>
      </div>

      {/* Инструкции */}
      <div className="bg-purple-50 rounded-xl p-5 border border-purple-100">
        <h3 className="font-medium text-purple-800 mb-3">Как получить Telegram ID:</h3>

        <div className="space-y-4">
          {/* Шаг 1 */}
          <div className="flex cursor-pointer group" onClick={() => setActiveStep(activeStep === 1 ? 0 : 1)}>
            <div className="mr-3 flex-shrink-0">
              <div className="w-7 h-7 rounded-full bg-white border-2 border-purple-200 flex items-center justify-center text-sm font-medium text-purple-500">
                1
              </div>
            </div>
            <div>
              <p className="text-gray-700 group-hover:text-purple-700 transition-colors">
                Зайдите в{" "}
                <a
                  href="https://t.me/baopaintbot"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-600 font-medium hover:text-purple-800 inline-flex items-center"
                >
                  @baopaintbot
                  <ExternalLink className="w-3 h-3 ml-1" />
                </a>{" "}
                и нажмите <code className="bg-white px-1.5 py-0.5 rounded text-purple-700 font-mono">/start</code>
              </p>

              {activeStep === 1 && (
                <div className="mt-2 bg-white p-3 rounded-lg border border-purple-100">
                  <p className="text-sm text-gray-600">
                    Этот бот используется для аутентификации в системе и будет отправлять вам коды подтверждения.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Шаг 2 */}
          <div className="flex cursor-pointer group" onClick={() => setActiveStep(activeStep === 2 ? 0 : 2)}>
            <div className="mr-3 flex-shrink-0">
              <div className="w-7 h-7 rounded-full bg-white border-2 border-purple-200 flex items-center justify-center text-sm font-medium text-purple-500">
                2
              </div>
            </div>
            <div>
              <p className="text-gray-700 group-hover:text-purple-700 transition-colors">
                Далее зайдите в{" "}
                <a
                  href="https://t.me/username_to_id_bot"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-600 font-medium hover:text-purple-800 inline-flex items-center"
                >
                  @username_to_id_bot
                  <ExternalLink className="w-3 h-3 ml-1" />
                </a>{" "}
                и нажмите <code className="bg-white px-1.5 py-0.5 rounded text-purple-700 font-mono">/start</code>
              </p>

              {activeStep === 2 && (
                <div className="mt-2 bg-white p-3 rounded-lg border border-purple-100">
                  <p className="text-sm text-gray-600">
                    Этот бот поможет вам узнать ваш Telegram ID, который необходим для привязки аккаунта.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Шаг 3 */}
          <div className="flex cursor-pointer group" onClick={() => setActiveStep(activeStep === 3 ? 0 : 3)}>
            <div className="mr-3 flex-shrink-0">
              <div className="w-7 h-7 rounded-full bg-white border-2 border-purple-200 flex items-center justify-center text-sm font-medium text-purple-500">
                3
              </div>
            </div>
            <div>
              <p className="text-gray-700 group-hover:text-purple-700 transition-colors">
                Полученный ID вставьте в поле выше.
              </p>

              {activeStep === 3 && (
                <div className="mt-2 bg-white p-3 rounded-lg border border-purple-100">
                  <p className="text-sm text-gray-600">
                    ID будет выглядеть как числовое значение, например: <span className="font-mono">123456789</span>
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Кнопка */}
      <button
        className={`
          w-full mt-2 bg-purple-500 hover:bg-purple-600 text-white font-medium py-3 px-6 rounded-lg
          transition-all duration-200 flex items-center justify-center
          ${!telegramId.trim() || isLoading ? "opacity-70 cursor-not-allowed" : "shadow-md hover:shadow-lg"}
        `}
        onClick={handleSubmit}
        disabled={!telegramId.trim() || isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
            <span>Привязка...</span>
          </>
        ) : (
          <>
            <span>Привязать Telegram</span>
            <ArrowRight className="w-5 h-5 ml-2" />
          </>
        )}
      </button>

      {/* Дополнительная информация */}
      <div className="text-center text-xs text-gray-500 mt-4">
        <p>Привязка Telegram необходима для обеспечения безопасности вашего аккаунта</p>
      </div>
    </div>
  )
}
