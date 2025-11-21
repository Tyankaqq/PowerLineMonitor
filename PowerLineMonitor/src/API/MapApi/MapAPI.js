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




export async function fetchDetectionsForRouteMap(routeId) {
    const response = await fetch(`${BASE_URL}routes/${routeId}/detections/map`);
    if (!response.ok) throw new Error('Ошибка загрузки карты для маршрута');
    return response.json();
}

export async function fetchImageLocation(imageId) {
    const response = await fetch(`${BASE_URL}images/${imageId}`);
    if (!response.ok) throw new Error('Ошибка загрузки координат изображения');
    const data = await response.json();

    // Преобразуем в формат маркера для карты
    if (data.gps_latitude && data.gps_longitude) {
        return [{
            id: data.image_id,
            latitude: data.gps_latitude,
            longitude: data.gps_longitude,
            defect_type: data.main_class,
            confidence: data.main_confidence,
            has_defects: data.detections && data.detections.length > 0
        }];
    }
    return [];
}