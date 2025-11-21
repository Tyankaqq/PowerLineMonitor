// API/RoutesAPI.js

const BASE_URL = 'https://c063f61fbd75.ngrok-free.app';

export async function fetchRoutesList() {
    const response = await fetch(`${BASE_URL}/routes/`);
    if (!response.ok) throw new Error('Ошибка получения списка папок');
    return response.json();
}
export async function createRoute(name) {
    const response = await fetch(`${BASE_URL}/routes/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name })
    });
    if (!response.ok) throw new Error('Ошибка создания маршрута');
    return response.json();
}

