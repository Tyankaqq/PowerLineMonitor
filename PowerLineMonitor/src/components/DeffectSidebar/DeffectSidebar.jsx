import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, ExternalLink, Calendar, MapPin } from 'lucide-react';
import styles from './DefectSidebar.module.css';
import { fetchImageCard } from '../../API/ImagesAPI/ImagesAPI';

const DefectSidebar = ({ marker, onClose }) => {
    const navigate = useNavigate();
    const [defectData, setDefectData] = useState(null);
    const [loading, setLoading] = useState(true);

    const BASE_URL = import.meta.env.VITE_API_URL || 'https://c063f61fbd75.ngrok-free.app';

    useEffect(() => {
        if (marker && marker.image_id) {
            loadDefectData();
        }
    }, [marker]);

    const loadDefectData = async () => {
        setLoading(true);
        try {
            const data = await fetchImageCard(marker.image_id);
            setDefectData(data);
        } catch (error) {
            console.error('Ошибка загрузки данных дефекта:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleViewFull = () => {
        navigate(`/isolator/${marker.image_id}`);
        onClose();
    };

    const getDefectTypeName = (type) => {
        const names = {
            'crack': 'Трещина',
            'corrosion': 'Коррозия',
            'chip': 'Скол',
            'missing-element': 'Отсутствующий элемент'
        };
        return names[type] || type;
    };

    const getDefectColor = (type) => {
        const colors = {
            'crack': '#ef4444',
            'corrosion': '#f97316',
            'chip': '#eab308',
            'missing-element': '#8b5cf6'
        };
        return colors[type] || '#3b82f6';
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Неизвестно';
        const date = new Date(dateString);
        return date.toLocaleDateString('ru-RU', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (!marker) return null;

    return (
        <>
            {/* Overlay */}
            <div className={styles.overlay} onClick={onClose} />

            {/* Sidebar */}
            <div className={styles.sidebar}>
                {/* Header */}
                <div className={styles.header}>
                    <h2>Дефект #{marker.detection_id}</h2>
                    <button className={styles.closeButton} onClick={onClose}>
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className={styles.content}>
                    {loading ? (
                        <div className={styles.loading}>
                            <div className={styles.spinner}></div>
                            <p>Загрузка данных...</p>
                        </div>
                    ) : defectData ? (
                        <>
                            {/* Image Preview */}
                            <div className={styles.imagePreview}>
                                {defectData.file_path && (
                                    <img
                                        src={`${BASE_URL}${defectData.file_path}`}
                                        alt="Превью дефекта"
                                        className={styles.previewImage}
                                    />
                                )}
                            </div>

                            {/* Info Section */}
                            <div className={styles.infoSection}>
                                <div className={styles.infoItem}>
                                    <div className={styles.infoLabel}>Тип дефекта</div>
                                    <div
                                        className={styles.defectTypeBadge}
                                        style={{
                                            background: `${getDefectColor(marker.defect_type)}20`,
                                            color: getDefectColor(marker.defect_type),
                                            border: `1px solid ${getDefectColor(marker.defect_type)}`
                                        }}
                                    >
                                        {getDefectTypeName(marker.defect_type)}
                                    </div>
                                </div>

                                <div className={styles.infoItem}>
                                    <div className={styles.infoLabel}>
                                        <Calendar size={16} />
                                        Дата создания
                                    </div>
                                    <div className={styles.infoValue}>
                                        {formatDate(marker.created_at)}
                                    </div>
                                </div>

                                <div className={styles.infoItem}>
                                    <div className={styles.infoLabel}>
                                        <MapPin size={16} />
                                        Координаты
                                    </div>
                                    <div className={styles.infoValue}>
                                        {marker.gps_latitude?.toFixed(6)}, {marker.gps_longitude?.toFixed(6)}
                                    </div>
                                </div>

                                {defectData.main_confidence && (
                                    <div className={styles.infoItem}>
                                        <div className={styles.infoLabel}>Уверенность детекции</div>
                                        <div className={styles.progressBar}>
                                            <div
                                                className={styles.progressFill}
                                                style={{
                                                    width: `${defectData.main_confidence * 100}%`,
                                                    background: getDefectColor(marker.defect_type)
                                                }}
                                            />
                                        </div>
                                        <div className={styles.progressValue}>
                                            {(defectData.main_confidence * 100).toFixed(2)}%
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Actions */}
                            <div className={styles.actions}>
                                <button
                                    className={styles.primaryButton}
                                    onClick={handleViewFull}
                                >
                                    <ExternalLink size={18} />
                                    Открыть полную информацию
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className={styles.error}>
                            <p>Не удалось загрузить данные</p>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default DefectSidebar;
