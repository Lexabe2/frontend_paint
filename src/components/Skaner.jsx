import React, { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";

export default function ZXingScanner() {
  const videoRef = useRef(null);
  const [result, setResult] = useState("");
  const codeReaderRef = useRef(null); // храним инстанс

  useEffect(() => {
    const codeReader = new BrowserMultiFormatReader();
    codeReaderRef.current = codeReader;

    codeReader
      .decodeFromVideoDevice(null, videoRef.current, (res, err) => {
        if (res) {
          setResult(res.getText());
          codeReader.reset(); // вернёмся к reset, работает в некоторых версиях
        }
      })
      .catch((err) => {
        console.error("Ошибка доступа к камере:", err);
      });

    return () => {
      try {
        codeReader.reset(); // очистка на размонтирование
      } catch (e) {
        console.warn("Не удалось остановить сканер:", e);
      }
    };
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Сканер QR / Штрихкода</h2>
      <video ref={videoRef} className="w-full max-w-md h-80 bg-black rounded" />
      {result && (
        <div className="mt-4 p-2 bg-green-100 text-green-800 rounded shadow">
          📦 Результат: {result}
        </div>
      )}
    </div>
  );
}
