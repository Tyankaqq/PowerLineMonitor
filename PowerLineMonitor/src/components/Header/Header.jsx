import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Bell, HelpCircle, User, Settings, LayoutDashboard } from 'lucide-react'; // Добавил иконку
import SettingsModal from '../SettingsModal/SettingsModal';
import NotificationsModal from '../NotificationsModal/NotificationsModal';
import { useNotifications } from '../../hooks/useNotifications.jsx';
import styles from './Header.module.css';

const Header = () => {
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [showSettingsModal, setShowSettingsModal] = useState(false);
    const [showNotificationsModal, setShowNotificationsModal] = useState(false);
    const { addNotification } = useNotifications();

    const isActive = (path) => {
        // Для главной страницы '/', проверяем точное совпадение
        if (path === '/') {
            return location.pathname === '/';
        }
        // Для остальных страниц проверяем, начинается ли путь с указанного
        return location.pathname.startsWith(path);
    };

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
                    {/* Новая ссылка на Дашборд (Аналитику) */}
                    <Link to="/" className={`${styles.navLink} ${isActive('/') ? styles.active : ''}`}>
                        Аналитика
                    </Link>
                    {/* Ссылка на загрузку теперь ведет на /upload */}
                    <Link to="/upload" className={`${styles.navLink} ${isActive('/upload') ? styles.active : ''}`}>
                        Загрузка фото
                    </Link>
                    <Link to="/inspections" className={`${styles.navLink} ${isActive('/inspections') ? styles.active : ''}`}>
                        История осмотров
                    </Link>
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
