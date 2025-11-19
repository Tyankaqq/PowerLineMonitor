import React from 'react';
import Modal from '../Modal/Modal';
import styles from './SettingsModal.module.css';

const SettingsModal = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <div className={styles.container}>
                <h2>Настройки системы</h2>

                <div className={styles.section}>
                    <h3>Общие</h3>
                    <div className={styles.settingItem}>
                        <div className={styles.settingLabel}>Язык интерфейса</div>
                        <div className={styles.settingValue}>Русский</div>
                    </div>
                    <div className={styles.settingItem}>
                        <div className={styles.settingLabel}>Тема оформления</div>
                        <div className={styles.settingValue}>Темная</div>
                    </div>
                    <div className={styles.settingItem}>
                        <div className={styles.settingLabel}>Часовой пояс</div>
                        <div className={styles.settingValue}>МСК (UTC+3)</div>
                    </div>
                </div>

                <div className={styles.section}>
                    <h3>Анализ</h3>
                    <div className={styles.settingItem}>
                        <div className={styles.settingLabel}>Автоматический анализ</div>
                        <div className={styles.settingValue}>Включено</div>
                    </div>
                    <div className={styles.settingItem}>
                        <div className={styles.settingLabel}>Обработка высокого разрешения</div>
                        <div className={styles.settingValue}>Включено</div>
                    </div>
                </div>

                <div className={styles.section}>
                    <h3>Уведомления</h3>
                    <div className={styles.settingItem}>
                        <div className={styles.settingLabel}>Включить уведомления</div>
                        <div className={styles.settingValue}>Включено</div>
                    </div>
                    <div className={styles.settingItem}>
                        <div className={styles.settingLabel}>Критические дефекты</div>
                        <div className={styles.settingValue}>Оповещать</div>
                    </div>
                </div>
            </div>
        </Modal>
    );
};

export default SettingsModal;
