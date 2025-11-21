// src/API/StatisticsAPI/StatisticsAPI.js

const BASE_URL = 'https://2b7f4284077b.ngrok-free.app';

if (!BASE_URL) {
    throw new Error("VITE_API_URL не установлена. Проверьте ваш .env файл.");
}

/**
 * Загружает общую статистику для карточек на дашборде.
 */
export async function fetchGeneralStats() {
    const response = await fetch(`${BASE_URL}/statistics/general`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        throw new Error(`Ошибка загрузки общей статистики: ${response.status} ${response.statusText}`);
    }

    return response.json();
}

/**
 * Загружает количество дефектов по дням за указанный период.
 * @param {string} startDate - Начальная дата в формате YYYY-MM-DD
 * @param {string} endDate - Конечная дата в формате YYYY-MM-DD
 */
export async function fetchDetectionsByDate(startDate, endDate) {
    // ВАЖНО: убрали слэш в конце
    const url = new URL(`${BASE_URL}/statistics/detections`);
    url.searchParams.append('start_date', startDate);
    url.searchParams.append('end_date', endDate);

    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        throw new Error(`Ошибка загрузки динамики дефектов: ${response.status} ${response.statusText}`);
    }

    return response.json();
}
