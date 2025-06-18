"use client"

import { useEffect } from "react"
import { useLocation } from "react-router-dom"

/**
 * Компонент для автоматической прокрутки страницы вверх при навигации
 *
 * @param {Object} props
 * @param {boolean} props.smooth - Использовать плавную прокрутку
 * @param {number} props.delay - Задержка прокрутки в миллисекундах
 * @param {string[]} props.excludePaths - Массив путей, для которых не нужна прокрутка
 */
const ScrollToTop = ({ smooth = true, delay = 0, excludePaths = [] }) => {
  const { pathname } = useLocation()

  useEffect(() => {
    // Проверяем, не находится ли текущий путь в списке исключений
    if (excludePaths.includes(pathname)) return

    // Добавляем опциональную задержку
    const timeoutId = setTimeout(() => {
      // Используем плавную прокрутку, если включена
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: smooth ? "smooth" : "auto",
      })
    }, delay)

    // Очищаем таймаут при размонтировании
    return () => clearTimeout(timeoutId)
  }, [pathname, smooth, delay, excludePaths])

  // Компонент не рендерит ничего в DOM
  return null
}

export default ScrollToTop
