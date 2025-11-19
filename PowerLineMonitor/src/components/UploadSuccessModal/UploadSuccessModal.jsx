// src/components/UploadSuccessModal/UploadSuccessModal.jsx
import React from 'react';
import { CheckCircle, Eye } from 'lucide-react';
import Modal from '../Modal/Modal';
import styles from './UploadSuccessModal.module.css';

const UploadSuccessModal = ({ isOpen, onClose, onViewResults, processedCount, defectsFound }) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <div className={styles.container}>
                <div className={styles.iconContainer}>
                    <CheckCircle size={64} className={styles.icon} />
                </div>

                <h2 className={styles.title}>Загрузка завершена</h2>
                <p className={styles.description}>
                    Все файлы успешно загружены и обработаны
                </p>

                <div className={styles.successInfo}>
                    <div className={styles.successIcon}>✓</div>
                    <div>
                        <p className={styles.successText}>Успешно обработано {processedCount} изображений{processedCount !== 1 && 'я'}</p>
                        <p className={styles.successSubtext}>
                            Результаты анализа доступны на карте и в истории осмотров
                        </p>
                    </div>
                </div>

                <div className={styles.results}>
                    <h3 className={styles.resultsTitle}>Результаты анализа:</h3>
                    <div className={styles.statsGrid}>
                        <div className={styles.stat}>
                            <div className={styles.statValue}>{defectsFound}</div>
                            <div className={styles.statLabel}>Дефекты найдены</div>
                        </div>
                        <div className={styles.stat}>
                            <div className={styles.statValue}>{processedCount}</div>
                            <div className={styles.statLabel}>Элементов проверено</div>
                        </div>
                    </div>
                </div>

                <div className={styles.actions}>
                    <button className={styles.btnSecondary} onClick={onClose}>
                        Закрыть
                    </button>
                    <button className={styles.btnPrimary} onClick={onViewResults}>
                        <Eye size={18} />
                        Посмотреть результаты
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default UploadSuccessModal;
