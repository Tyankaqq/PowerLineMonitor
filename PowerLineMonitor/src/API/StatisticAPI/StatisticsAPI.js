// src/API/StatisticsAPI/StatisticsAPI.js

const BASE_URL = 'https://62debf3d6a72.ngrok-free.app';

// Проверка, чтобы убедиться, что переменная окружения установлена
if (!BASE_URL) {
    throw new Error("VITE_API_URL не установлена. Проверьте ваш .env файл.");
}

/**
 * Загружает общую статистику для карточек на дашборде.
 */
export async function fetchGeneralStats() {
    const response = await fetch(`${BASE_URL}/statistics/general/`);
    if (!response.ok) {
        throw new Error(`Ошибка загрузки общей статистики: ${response.statusText}`);
    }
    return response.json();
}

/**
 * Загружает количество дефектов по дням за указанный период.
 * @param {string} startDate - Начальная дата в формате YYYY-MM-DD
 * @param {string} endDate - Конечная дата в формате YYYY-MM-DD
 */
export async function fetchDetectionsByDate(startDate, endDate) {
    // Создаем URL с query-параметрами
    const url = new URL(`${BASE_URL}/statistics/detections/`);
    url.searchParams.append('start_date', startDate);
    url.searchParams.append('end_date', endDate);

    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Ошибка загрузки динамики дефектов: ${response.statusText}`);
    }
    return response.json();
}

/**
 * Загружает распределение типов дефектов для круговой диаграммы.
 * (Вам нужно будет создать этот эндпоинт на бэкенде)
 */
export async function fetchDefectTypes() {
    const response = await fetch(`${BASE_URL}/statistics/defect-types/`);
    if (!response.ok) {
        throw new Error(`Ошибка загрузки типов дефектов: ${response.statusText}`);
    }
    // Ожидаемый формат: [{ type: 'Коррозия', count: 82, color: '#ef4444' }, ...]
    return response.json();
}
