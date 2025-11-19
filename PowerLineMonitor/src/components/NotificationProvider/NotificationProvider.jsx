import React, { createContext, useContext, useState, useEffect } from 'react';
import Toast from '../../common/Toast';  // Путь до вашего компонента Toast

const NotificationContext = createContext();

export const useNotifications = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);

    const [toastNotification, setToastNotification] = useState(null);

    const addNotification = (notif) => {
        setNotifications(prev => [notif, ...prev]);
        setToastNotification(notif);   // Показываем toast при добавлении уведомления
        console.log('Добавлено уведомление:', notif);
    };
    console.log('Текущий список уведомлений:', notifications);
    const markRead = (id) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    };

    const removeNotification = (id) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    const clearNotifications = () => setNotifications([]);

    const closeToast = () => setToastNotification(null);

    useEffect(() => {
        if (toastNotification) {
            const timer = setTimeout(() => setToastNotification(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [toastNotification]);
    console.log('NotificationsModal уведомления:', notifications);
    return (
        <NotificationContext.Provider value={{ notifications, addNotification, markRead, removeNotification, clearNotifications }}>
            {children}

            {toastNotification && (
                <Toast
                    message={toastNotification.message}
                    type={toastNotification.type}
                    onClose={closeToast}
                    duration={3000}
                />
            )}
        </NotificationContext.Provider>
    );
};
