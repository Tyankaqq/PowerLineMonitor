// src/API/MapAPI/MapAPI.js

const BASE_URL = import.meta.env.VITE_API_URL || 'https://c063f61fbd75.ngrok-free.app';

if (!import.meta.env.VITE_API_URL) {
    console.warn('⚠️ VITE_API_URL не установлена в .env файле. Используется дефолтный URL.');
}

/**
 * Получить все детекции с GPS координатами для отображения на карте
 * @returns {Promise<Array>} - Массив объектов с координатами и информацией о дефектах
 */
export async function fetchDetectionsForMap() {
    // ИСПРАВЛЕНО: Убран слэш в начале пути
    const response = await fetch(`${BASE_URL}detections/map`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        throw new Error(`Ошибка загрузки данных карты: ${response.status} ${response.statusText}`);
    }

    return response.json();
}
