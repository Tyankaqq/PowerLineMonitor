import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Bell, HelpCircle, User, Settings } from 'lucide-react';
import SettingsModal from '../SettingsModal/SettingsModal';
import NotificationsModal from '../NotificationsModal/NotificationsModal';
import { useNotifications } from '../../hooks/useNotifications.jsx'; // импортировать хук
import styles from './Header.module.css';

const Header = () => {
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [showSettingsModal, setShowSettingsModal] = useState(false);
    const [showNotificationsModal, setShowNotificationsModal] = useState(false);
    const { addNotification } = useNotifications();

    const isActive = (path) => {
        if (path === '/' && location.pathname === '/') return true;
        if (path !== '/' && location.pathname.startsWith(path)) return true;
        return false;
    };

    // Пример вызова уведомления (можно вызвать из любого компонента)
    const demoNotify = () => {
        addNotification({
            id: `notif-${Date.now()}`,
            type: 'error',
            title: 'Критический дефект обнаружен',
            message: 'Обнаружен критический дефект виброгасителя на ЛЭП-220-01, Опора 47',
            time: '5 мин назад',
            read: false,
        });
    };

    return (
        <>
            <header className={styles.header}>
                <div className={styles.headerLeft}>
                    <Link to="/" className={styles.logo} onClick={() => setIsMobileMenuOpen(false)}>
                        <span className={styles.logoIcon}>⚡</span>
                        <span className={styles.logoText}>PowerLine Monitor</span>
                    </Link>
                </div>
                <nav className={`${styles.headerNav} ${isMobileMenuOpen ? styles.open : ''}`}>
                    <Link to="/" className={`${styles.navLink} ${isActive('/') && location.pathname === '/' ? styles.active : ''}`}>Загрузка фото</Link>
                    <Link to="/inspections" className={`${styles.navLink} ${isActive('/inspections') ? styles.active : ''}`}>История осмотров</Link>

                </nav>
                <div className={styles.headerRight}>
                    <button className={styles.iconBtn} title="Уведомления" onClick={() => setShowNotificationsModal(true)}>
                        <Bell size={20} />
                    </button>
                    <button className={styles.iconBtn} title="Настройки" onClick={() => setShowSettingsModal(true)}><Settings size={20} /></button>
                    <button className={styles.iconBtn} title="Помощь" onClick={demoNotify}><HelpCircle size={20} /></button>
                    <div className={styles.userAvatar}><User size={20} /></div>
                </div>
            </header>
            {showSettingsModal && (
                <SettingsModal isOpen={showSettingsModal} onClose={() => setShowSettingsModal(false)} />
            )}
            {showNotificationsModal && (
                <NotificationsModal isOpen={showNotificationsModal} onClose={() => setShowNotificationsModal(false)} />
            )}
        </>
    );
};

export default Header;
