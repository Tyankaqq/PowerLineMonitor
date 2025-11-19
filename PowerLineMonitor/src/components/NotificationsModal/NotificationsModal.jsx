import React from 'react';
import styles from './NotificationsModal.module.css';
import { useNotifications } from '../../hooks/useNotifications.jsx';

const notificationIcons = {
    error: "🔴",
    success: "✅",
    info: "ℹ️",
};

const NotificationsModal = ({ isOpen, onClose }) => {
    const { notifications, markRead, removeNotification, clearNotifications } = useNotifications();
    console.log('Уведомления:', notifications);
    if (!isOpen) return null;

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modal}>
                <div className={styles.modalHeader}>
                    <span>Уведомления</span>
                    <button className={styles.closeBtn} onClick={onClose}>✕</button>
                </div>
                <div className={styles.notificationsList}>
                    {notifications.map(n => (
                        <div key={n.id} className={styles.notification + ' ' + styles[n.type]}>
                            <span className={styles.icon}>{notificationIcons[n.type] || "🔔"}</span>
                            <div className={styles.content}>
                                <strong>{n.title}</strong>
                                <div>{n.message}</div>
                                <div className={styles.meta}>
                                    <small>{n.time}</small>
                                    {!n.read && (
                                        <button className={styles.readBtn} onClick={() => markRead(n.id)}>Отметить как прочитанное</button>
                                    )}
                                </div>
                            </div>
                            <button className={styles.removeBtn} onClick={() => removeNotification(n.id)}>✕</button>
                        </div>
                    ))}
                </div>
                <div className={styles.modalFooter}>
                    <button className={styles.clearBtn} onClick={clearNotifications}>Очистить все</button>
                    <button className={styles.closeModalBtn} onClick={onClose}>Закрыть</button>
                </div>
            </div>
        </div>
    );
};

export default NotificationsModal;
