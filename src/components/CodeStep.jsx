"use client"
import React from 'react';
import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { CheckCircle, ArrowRight, RefreshCw } from "lucide-react"

export default function CodeStep({ code, setCode, onVerify }) {
  const [isLoading, setIsLoading] = useState(false)
  const [timeLeft, setTimeLeft] = useState(30)
  const [activeInput, setActiveInput] = useState(0)
  const inputRefs = useRef([])

  // Инициализация массива ссылок на инпуты
  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, 6)
    // Фокус на первом поле при загрузке
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus()
    }
  }, [])

  // Таймер обратного отсчета
  useEffect(() => {
    if (timeLeft <= 0) return

    const timer = setTimeout(() => {
      setTimeLeft(timeLeft - 1)
    }, 1000)

    return () => clearTimeout(timer)
  }, [timeLeft])

  // Обработка ввода кода
  const handleInputChange = (e, index) => {
    const value = e.target.value.replace(/[^0-9]/g, "")

    if (value.length <= 1) {
      // Обновляем код
      const newCode = code.split("")
      newCode[index] = value
      setCode(newCode.join(""))

      // Если ввели цифру и есть следующее поле - переходим к нему
      if (value && index < 5) {
        inputRefs.current[index + 1].focus()
        setActiveInput(index + 1)
      }
    }
  }

  // Обработка нажатия клавиш
  const handleKeyDown = (e, index) => {
    // При нажатии Backspace
    if (e.key === "Backspace") {
      if (!code[index] && index > 0) {
        // Если текущее поле пустое и есть предыдущее - переходим к нему
        inputRefs.current[index - 1].focus()
        setActiveInput(index - 1)
      }
    }

    // При нажатии стрелок
    if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1].focus()
      setActiveInput(index - 1)
    }

    if (e.key === "ArrowRight" && index < 5) {
      inputRefs.current[index + 1].focus()
      setActiveInput(index + 1)
    }
  }

  // Обработка вставки из буфера обмена
  const handlePaste = (e) => {
    e.preventDefault()
    const pasteData = e.clipboardData
      .getData("text")
      .replace(/[^0-9]/g, "")
      .slice(0, 6)

    if (pasteData) {
      setCode(pasteData.padEnd(6, "").slice(0, 6))

      // Фокус на последнем заполненном поле
      const lastIndex = Math.min(pasteData.length - 1, 5)
      if (inputRefs.current[lastIndex]) {
        inputRefs.current[lastIndex].focus()
        setActiveInput(lastIndex)
      }
    }
  }

  // Имитация процесса верификации
  const handleVerify = async () => {
    if (code.length !== 6 || isLoading) return

    setIsLoading(true)

    // Имитация запроса к серверу
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500))
      onVerify()
    } catch (error) {
      console.error("Verification failed:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Повторная отправка кода
  const resendCode = () => {
    if (timeLeft > 0) return
    setTimeLeft(30)
    // Здесь была бы логика повторной отправки кода
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <motion.div
        className="bg-white rounded-2xl p-8 shadow-xl border border-gray-100"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </motion.div>

          <h2 className="text-2xl font-bold text-gray-800 mb-2">Подтверждение</h2>
          <p className="text-gray-500">Введите 6-значный код, отправленный на ваш телефон</p>
        </div>

        {/* Поля для ввода кода */}
        <div className="mb-8">
          <div className="flex justify-between gap-2 mb-6">
            {[0, 1, 2, 3, 4, 5].map((index) => (
              <motion.div
                key={index}
                className={`
                  relative w-12 h-16 rounded-xl overflow-hidden
                  ${activeInput === index ? "ring-2 ring-green-500 ring-offset-2" : "border-2 border-gray-200"}
                `}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 + 0.3 }}
              >
                <input
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={code[index] || ""}
                  onChange={(e) => handleInputChange(e, index)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  onPaste={index === 0 ? handlePaste : undefined}
                  onFocus={() => setActiveInput(index)}
                  className="w-full h-full text-center text-xl font-bold bg-transparent focus:outline-none"
                />

                {/* Анимированный индикатор активного поля */}
                {activeInput === index && (
                  <motion.div className="absolute bottom-0 left-0 w-full h-1 bg-green-500" layoutId="activeIndicator" />
                )}
              </motion.div>
            ))}
          </div>

          {/* Визуальный индикатор прогресса */}
          <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-green-500"
              initial={{ width: 0 }}
              animate={{ width: `${(code.length / 6) * 100}%` }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
          </div>
        </div>

        {/* Кнопка подтверждения */}
        <motion.button
          className={`
            w-full py-4 px-6 rounded-xl font-medium text-white
            flex items-center justify-center space-x-2
            transition-all duration-300 shadow-md
            ${code.length === 6 && !isLoading ? "bg-green-500 hover:bg-green-600" : "bg-gray-200 text-gray-400 cursor-not-allowed"}
          `}
          onClick={handleVerify}
          whileTap={code.length === 6 && !isLoading ? { scale: 0.98 } : {}}
          whileHover={
            code.length === 6 && !isLoading
              ? { scale: 1.01, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)" }
              : {}
          }
          disabled={code.length !== 6 || isLoading}
        >
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <RefreshCw className="w-5 h-5 animate-spin" />
              </motion.div>
            ) : (
              <motion.div
                key="verify"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center"
              >
                <span>Подтвердить</span>
                <ArrowRight className="w-5 h-5 ml-2" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>

        {/* Повторная отправка кода */}
        <div className="mt-6 text-center">
          {timeLeft > 0 ? (
            <p className="text-sm text-gray-500">
              Повторная отправка через <span className="font-medium text-gray-700">{timeLeft} сек</span>
            </p>
          ) : (
            <button
              className="text-sm text-green-600 hover:text-green-700 hover:underline transition-colors font-medium"
              onClick={resendCode}
            >
              Отправить код повторно
            </button>
          )}
        </div>
      </motion.div>

      {/* Дополнительная информация */}
      <motion.div
        className="mt-4 text-center text-xs text-gray-500"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        Проблемы с получением кода? <button className="text-green-600 hover:underline">Свяжитесь с поддержкой</button>
      </motion.div>
    </div>
  )
}
