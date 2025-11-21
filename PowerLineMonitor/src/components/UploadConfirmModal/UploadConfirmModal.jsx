// src/components/UploadConfirmModal/UploadConfirmModal.jsx
import React, { useState, useEffect } from 'react';
import { Upload, Plus } from 'lucide-react';
import Modal from '../Modal/Modal';
import { createRoute } from '../../API/RoutesAPI/RoutesAPI';
import styles from './UploadConfirmModal.module.css';

const UploadConfirmModal = ({ isOpen, onClose, onConfirm, filesCount, routes, onRoutesUpdate }) => {
    const [selectedRouteId, setSelectedRouteId] = useState(null);
    const [isCreatingNew, setIsCreatingNew] = useState(false);
    const [newRouteName, setNewRouteName] = useState('');
    const [creating, setCreating] = useState(false);
    const [error, setError] = useState(null);

    // Автовыбор первого маршрута при открытии модалки
    useEffect(() => {
        if (isOpen && routes.length > 0 && !selectedRouteId) {
            setSelectedRouteId(routes[0].id);
        }
    }, [isOpen, routes, selectedRouteId]);

    const handleCreateNewRoute = async () => {
        if (!newRouteName.trim()) {
            setError('Введите название вылета');
            return;
        }

        setCreating(true);
        setError(null);
        try {
            const newRoute = await createRoute(newRouteName.trim());

            // Обновляем список маршрутов
            await onRoutesUpdate();

            // Автоматически выбираем только что созданную папку
            setSelectedRouteId(newRoute.id);

            setIsCreatingNew(false);
            setNewRouteName('');
        } catch (err) {
            console.error('Ошибка создания маршрута:', err);
            setError('Не удалось создать маршрут. Попробуйте снова.');
        } finally {
            setCreating(false);
        }
    };

    const handleConfirm = () => {
        if (selectedRouteId) {
            onConfirm(selectedRouteId);
            // Сброс состояния при закрытии
            setIsCreatingNew(false);
            setNewRouteName('');
            setError(null);
        }
    };

    const handleClose = () => {
        setIsCreatingNew(false);
        setNewRouteName('');
        setError(null);
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose}>
            <div className={styles.container}>
                <div className={styles.iconContainer}>
                    <Upload size={48} className={styles.icon} />
                </div>

                <h2 className={styles.title}>Подтверждение загрузки</h2>
                <p className={styles.description}>
                    Выберите вылет для загрузки {filesCount} файл{filesCount > 1 ? 'ов' : 'а'}
                </p>

                <div className={styles.routeSelection}>
                    <label className={styles.label}>Вылет:</label>

                    {!isCreatingNew ? (
                        <>
                            <select
                                value={selectedRouteId || ''}
                                onChange={e => setSelectedRouteId(Number(e.target.value))}
                                className={styles.select}
                            >
                                {routes.length === 0 && (
                                    <option value="">Нет доступных вылетов</option>
                                )}
                                {routes.map(route => (
                                    <option key={route.id} value={route.id}>
                                        {route.name} ({new Date(route.created_at).toLocaleDateString('ru-RU')})
                                    </option>
                                ))}
                            </select>

                            <button
                                className={styles.btnCreateNew}
                                onClick={() => setIsCreatingNew(true)}
                                type="button"
                            >
                                <Plus size={16} /> Создать новый вылет
                            </button>
                        </>
                    ) : (
                        <div className={styles.newRouteForm}>
                            <input
                                type="text"
                                placeholder="Название нового вылета (например, Вылет 3)"
                                value={newRouteName}
                                onChange={e => setNewRouteName(e.target.value)}
                                onKeyPress={e => e.key === 'Enter' && handleCreateNewRoute()}
                                className={styles.input}
                                autoFocus
                            />
                            {error && <p className={styles.error}>{error}</p>}
                            <div className={styles.newRouteActions}>
                                <button
                                    className={styles.btnConfirmNew}
                                    onClick={handleCreateNewRoute}
                                    disabled={!newRouteName.trim() || creating}
                                    type="button"
                                >
                                    {creating ? 'Создание...' : 'Создать'}
                                </button>
                                <button
                                    className={styles.btnCancelNew}
                                    onClick={() => {
                                        setIsCreatingNew(false);
                                        setNewRouteName('');
                                        setError(null);
                                    }}
                                    type="button"
                                >
                                    Отмена
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                <ul className={styles.features}>
                    <li>Изображения будут обработаны системой AI</li>
                    <li>Обнаруженные дефекты будут отмечены на карте</li>
                    <li>Результаты будут доступны в выбранном вылете</li>
                </ul>

                <div className={styles.actions}>
                    <button className={styles.btnCancel} onClick={handleClose}>
                        Отмена
                    </button>
                    <button
                        className={styles.btnConfirm}
                        onClick={handleConfirm}
                        disabled={!selectedRouteId || isCreatingNew}
                    >
                        Загрузить файлы
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default UploadConfirmModal;
