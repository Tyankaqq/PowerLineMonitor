// src/API/ImagesAPI/ImagesAPI.js
const BASE_URL = 'https://c063f61fbd75.ngrok-free.app';

/**
 * Загрузить изображения для анализа
 * @param {File[]} images - Массив файлов изображений
 * @returns {Promise<Array>} - Массив результатов анализа
 */
export async function uploadImagesForAnalysis(images) {
    const formData = new FormData();

    // Добавляем каждое изображение в FormData
    images.forEach(image => {
        formData.append('files', image); // ✅ Правильно - files
    });

    const response = await fetch(`${BASE_URL}/predict/`, {
        method: 'POST',
        body: formData,
        // Не указываем Content-Type, браузер сам установит multipart/form-data
    });

    if (!response.ok) {
        throw new Error(`Ошибка загрузки изображений: ${response.status} ${response.statusText}`);
    }

    return response.json();
}
/**
 * Получить карточку изображения и её анализ по image_id
 * @param {number|string} imageId - ID изображения
 * @returns {Promise<Object>} - Объект карточки с анализом (см. пример в swagger)
 */
export async function fetchImageCard(imageId) {
    const response = await fetch(`${BASE_URL}/images/${imageId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            // Добавьте авторизацию, если требуется
        },
    });

    if (!response.ok) {
        throw new Error(`Ошибка получения карточки изображения: ${response.status} ${response.statusText}`);
    }

    return response.json();
}
/**
 * Загрузить одно изображение для анализа
 * @param {File} image - Файл изображения
 * @returns {Promise<Object>} - Результат анализа
 */
export async function uploadSingleImage(image) {
    const formData = new FormData();
    formData.append('files', image);

    const response = await fetch(`${BASE_URL}/predict/`, {
        method: 'POST',
        body: formData
    });

    if (!response.ok) {
        throw new Error(`Ошибка загрузки изображения: ${response.status} ${response.statusText}`);
    }

    const results = await response.json();
    return results[0]; // Возвращаем первый результат
}
export async function fetchImagesList() {
    const response = await fetch(`${BASE_URL}/images/`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            // 'Authorization': 'Bearer token', // Если нужно
        },
    });

    if (!response.ok) {
        throw new Error(`Ошибка получения списка изображений: ${response.status} ${response.statusText}`);
    }

    return response.json();
}
/**
 * Обновить степень критичности изображения
 * @param {number} imageId - ID изображения
 * @param {number} criticality - Степень критичности от 0 до 5
 * @returns {Promise<Object>}
 */
export async function updateImageCriticality(imageId, criticality) {
    const response = await fetch(`${BASE_URL}/images/${imageId}/criticality`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ criticality })
    });

    if (!response.ok) {
        throw new Error(`Ошибка обновления критичности: ${response.status} ${response.statusText}`);
    }

    return response.json();
}
