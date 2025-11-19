// src/components/LineVisualization/LineVisualization.jsx
import React from 'react';
import styles from './LineVisualization.module.css';

const LineVisualization = ({ towers, onTowerClick, expandedTowers }) => {
    return (
        <div className={styles.visualization}>
            <div className={styles.header}>
                <h3>Обзор линии и состояние компонентов</h3>
                <div className={styles.legend}>
          <span className={styles.legendItem}>
            <span className={`${styles.legendDot} ${styles.green}`}></span> Норма
          </span>
                    <span className={styles.legendItem}>
            <span className={`${styles.legendDot} ${styles.yellow}`}></span> Внимание
          </span>
                    <span className={styles.legendItem}>
            <span className={`${styles.legendDot} ${styles.red}`}></span> Критично
          </span>
                </div>
            </div>

            <div className={styles.schema}>
                <div className={styles.schemaLine}>
                    {towers.map((tower, index) => (
                        <React.Fragment key={tower.id}>
                            <div
                                className={`${styles.towerGroup} ${expandedTowers.has(tower.id) ? styles.selected : ''}`}
                                onClick={() => onTowerClick(tower.id)}
                            >
                                <div className={styles.towerIcon}>
                                    <div className={styles.towerStructure}></div>
                                    <span className={styles.towerLabel}>{tower.name}</span>
                                </div>
                                <div className={styles.componentsMini}>
                                    {tower.components.slice(0, 4).map(component => (
                                        <div
                                            key={component.id}
                                            className={`${styles.componentDot} ${styles[component.status]}`}
                                            title={component.name}
                                        ></div>
                                    ))}
                                </div>
                            </div>

                            {index < towers.length - 1 && <div className={styles.wireSegment}></div>}
                        </React.Fragment>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default LineVisualization;
