import React, { createContext, useContext, useState } from 'react';

const NotificationContext = createContext();

export const useNotifications = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);

    const addNotification = (notif) => {
        setNotifications(prev => [notif, ...prev]);
    };

    const markRead = (id) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    };

    const removeNotification = (id) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    const clearNotifications = () => setNotifications([]);

    return (
        <NotificationContext.Provider
            value={{ notifications, addNotification, markRead, removeNotification, clearNotifications }}
        >
            {children}
        </NotificationContext.Provider>
    );
};
