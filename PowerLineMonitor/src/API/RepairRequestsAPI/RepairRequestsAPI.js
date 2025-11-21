// src/API/RepairRequestsAPI/RepairRequestsAPI.js

const BASE_URL = 'https://2b7f4284077b.ngrok-free.app';

/**
 * Создание заявки на ремонт для дефекта
 * @param {number} detectionId - ID дефекта (detection_id)
 * @returns {Promise<Object>} - Созданная заявка с полями: repair_request_id, detection_id, status, created_at
 */
export async function createRepairRequest(detectionId) {
    const response = await fetch(`${BASE_URL}/detections/${detectionId}/repair_request`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        throw new Error(`Ошибка создания заявки: ${response.status} ${response.statusText}`);
    }

    return response.json();
}
