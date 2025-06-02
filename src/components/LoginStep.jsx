"use client"
import React from 'react';
import { useState, useRef, useEffect } from "react"
import { User, Lock, Eye, EyeOff, Loader2 } from "lucide-react"

export default function LoginStep({ username, password, setUsername, setPassword, onLogin }) {
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const usernameRef = useRef(null)

  // Автофокус на поле логина при загрузке
  useEffect(() => {
    if (usernameRef.current) {
      usernameRef.current.focus()
    }
  }, [])

  // Проверка заполнения полей
  const isFormValid = username.trim() !== "" && password.trim() !== ""

  // Обработчик входа с имитацией загрузки
  const handleLogin = async () => {
    if (!isFormValid || isLoading) return

    setIsLoading(true)

    // Имитация запроса к серверу
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      onLogin()
    } catch (error) {
      console.error("Login failed:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Обработчик нажатия клавиш
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && isFormValid && !isLoading) {
      e.preventDefault()
      handleLogin()
    }
  }

  // Обработчик отправки формы
  const handleSubmit = (e) => {
    e.preventDefault()
    if (isFormValid && !isLoading) {
      handleLogin()
    }
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white rounded-xl p-6 shadow-md">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-blue-500" />
          </div>

          <h2 className="text-2xl font-bold text-gray-800 mb-2">Вход в систему</h2>
          <p className="text-gray-500">Введите ваши учетные данные для входа</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Поле логина */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Логин</label>
            <div className="relative rounded-lg border border-gray-300 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-400" />
              </div>
              <input
                ref={usernameRef}
                className="block w-full pl-10 pr-3 py-3 border-0 rounded-lg focus:outline-none focus:ring-0 bg-transparent"
                placeholder="Введите ваш логин"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isLoading}
                autoComplete="username"
                type="text"
              />
            </div>
          </div>

          {/* Поле пароля */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Пароль</label>
            <div className="relative rounded-lg border border-gray-300 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                className="block w-full pl-10 pr-10 py-3 border-0 rounded-lg focus:outline-none focus:ring-0 bg-transparent"
                type={showPassword ? "text" : "password"}
                placeholder="Введите ваш пароль"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isLoading}
                autoComplete="current-password"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                disabled={isLoading}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400" />
                )}
              </button>
            </div>
          </div>

          {/* Опция "Запомнить меня" */}
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-blue-500 border-gray-300 rounded focus:ring-blue-500"
                checked={rememberMe}
                onChange={() => setRememberMe(!rememberMe)}
                disabled={isLoading}
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                Запомнить меня
              </label>
            </div>
            <div className="text-sm">
              <a href="#" className="font-medium text-blue-600 hover:text-blue-500">
                Забыли пароль?
              </a>
            </div>
          </div>

          {/* Кнопка входа */}
          <button
            type="submit"
            className={`
              w-full py-3 px-4 rounded-lg font-medium text-white
              transition-colors duration-200
              ${isFormValid && !isLoading ? "bg-blue-500 hover:bg-blue-600" : "bg-gray-300 cursor-not-allowed"}
            `}
            disabled={!isFormValid || isLoading}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                <span>Вход...</span>
              </div>
            ) : (
              <span>Войти</span>
            )}
          </button>
        </form>

        {/* Регистрация */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Нет аккаунта?{" "}
            <a href="#" className="font-medium text-blue-600 hover:text-blue-500">
              Зарегистрироваться
            </a>
          </p>
        </div>
      </div>

      {/* Дополнительная информация */}
      <div className="mt-4 text-center text-xs text-gray-500">Нажмите Enter для входа • Защищено шифрованием</div>
    </div>
  )
}
