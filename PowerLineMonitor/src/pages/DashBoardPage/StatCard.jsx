import React from 'react';
import styles from './DashboardPage.module.css';

// Добавляем проп isLarge с значением по умолчанию false
const StatCard = ({ icon, title, value, subtitle, style, isLarge = false }) => {
    // В зависимости от isLarge, добавляем дополнительный класс
    const cardClasses = `${styles.statCard} ${isLarge ? styles.large : ''}`;

    return (
        <div className={cardClasses} style={style}>
            <div className={styles.cardIcon}>
                {icon}
            </div>
            <div className={styles.cardContent}>
                <span className={styles.cardValue}>{value}</span>
                <h3 className={styles.cardTitle}>{title}</h3>
                {subtitle && <p className={styles.cardSubtitle}>{subtitle}</p>}
            </div>
        </div>
    );
};

export default StatCard;
