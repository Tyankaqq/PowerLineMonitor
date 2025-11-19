// src/components/ComponentItem/ComponentItem.jsx
import React from 'react';
import { ChevronRight } from 'lucide-react';
import styles from './ComponentItem.module.css';

const ComponentItem = ({ component, onClick }) => {
    const getComponentIcon = (type) => {
        switch (type) {
            case 'insulator':
                return '⚡';
            case 'damper':
                return '〰️';
            case 'traverse':
                return '—';
            default:
                return '🔧';
        }
    };

    const getComponentTypeName = (type) => {
        switch (type) {
            case 'insulator':
                return 'Изолятор';
            case 'damper':
                return 'Виброгаситель';
            case 'traverse':
                return 'Траверса';
            default:
                return 'Компонент';
        }
    };

    return (
        <div
            className={styles.componentItem}
            onClick={(e) => {
                e.stopPropagation();
                onClick();
            }}
        >
            <div className={`${styles.icon} ${styles[component.type]}`}>
                <span>{getComponentIcon(component.type)}</span>
            </div>
            <span className={styles.name}>{component.name}</span>
            <span className={styles.typeLabel}>
        {getComponentTypeName(component.type)}
      </span>
            {component.status !== 'green' && (
                <span className={`${styles.statusBadge} ${styles[component.status]}`}>
          {component.status === 'red' ? 'Критично' : 'Внимание'}
        </span>
            )}
            <ChevronRight size={18} className={styles.chevron} />
        </div>
    );
};

export default ComponentItem;
