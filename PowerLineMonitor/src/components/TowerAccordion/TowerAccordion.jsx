// src/components/TowerAccordion/TowerAccordion.jsx
import React from 'react';
import { ChevronRight, ChevronDown } from 'lucide-react';
import ComponentItem from '../ComponentItem/ComponentItem.jsx';
import styles from './TowerAccordion.module.css';

const TowerAccordion = ({ tower, isExpanded, onToggle, onComponentClick }) => {
    const hasRedStatus = tower.components.some(c => c.status === 'red');
    const hasYellowStatus = tower.components.some(c => c.status === 'yellow') && !hasRedStatus;

    return (
        <div className={styles.accordionItem}>
            <div
                className={`${styles.header} ${isExpanded ? styles.expanded : ''}`}
                onClick={onToggle}
            >
                <div className={styles.headerLeft}>
                    <div className={styles.towerIcon}>
                        <span>🗼</span>
                    </div>
                    <span className={styles.towerName}>{tower.name}</span>
                    <span className={styles.componentsCount}>
            ({tower.components.length} компонентов)
          </span>
                </div>
                <div className={styles.headerRight}>
                    {hasRedStatus && (
                        <span className={`${styles.statusBadge} ${styles.red}`}>Критично</span>
                    )}
                    {hasYellowStatus && (
                        <span className={`${styles.statusBadge} ${styles.yellow}`}>Внимание</span>
                    )}
                    {isExpanded ? (
                        <ChevronDown size={20} className={styles.chevron} />
                    ) : (
                        <ChevronRight size={20} className={styles.chevron} />
                    )}
                </div>
            </div>

            {isExpanded && (
                <div className={styles.componentsContainer}>
                    {tower.components.map((component) => (
                        <ComponentItem
                            key={component.id}
                            component={component}
                            onClick={() => onComponentClick(component.id)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default TowerAccordion;
