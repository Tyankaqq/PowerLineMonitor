// src/components/UploadConfirmModal/UploadConfirmModal.jsx
import React from 'react';
import { Upload } from 'lucide-react';
import Modal from '../Modal/Modal';
import styles from './UploadConfirmModal.module.css';

const UploadConfirmModal = ({ isOpen, onClose, onConfirm, filesCount }) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <div className={styles.container}>
                <div className={styles.iconContainer}>
                    <Upload size={48} className={styles.icon} />
                </div>

                <h2 className={styles.title}>Подтверждение загрузки</h2>
                <p className={styles.description}>
                    Вы уверены, что хотите загрузить выбранные файлы?
                </p>

                <div className={styles.fileInfo}>
                    <div className={styles.fileIcon}>📄</div>
                    <div className={styles.fileDetails}>
                        <p className={styles.fileCount}>Будет загружено {filesCount} файл{filesCount > 1 ? 'а' : ''}</p>
                        <p className={styles.fileSubtext}>После загрузки начнется автоматический анализ изображений</p>
                    </div>
                </div>

                <ul className={styles.features}>
                    <li>Изображения будут обработаны системой AI</li>
                    <li>Обнаруженные дефекты будут отмечены на карте</li>
                    <li>Вы получите уведомление по завершении анализа</li>
                </ul>

                <div className={styles.actions}>
                    <button className={styles.btnCancel} onClick={onClose}>
                        Отмена
                    </button>
                    <button className={styles.btnConfirm} onClick={onConfirm}>
                        Загрузить файлы
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default UploadConfirmModal;
