// src/components/AdvancedFiltersModal/AdvancedFiltersModal.jsx
import React, { useState } from 'react';
import Modal from '../Modal/Modal';
import { Calendar } from 'lucide-react';
import styles from './AdvancedFiltersModal.module.css';

const AdvancedFiltersModal = ({ isOpen, onClose, onApply }) => {
    const [dateFrom, setDateFrom] = useState('2024-01-05');
    const [dateTo, setDateTo] = useState('2024-01-30');
    const [defectType, setDefectType] = useState('');
    const [elementStatus, setElementStatus] = useState('');
    const [location, setLocation] = useState('');
    const [reportType, setReportType] = useState('summary');

    const handleApply = () => {
        const filters = {
            dateFrom,
            dateTo,
            defectType,
            elementStatus,
            location,
            reportType
        };

        onApply?.(filters);
        onClose();
    };

    const handleReset = () => {
        setDateFrom('');
        setDateTo('');
        setDefectType('');
        setElementStatus('');
        setLocation('');
        setReportType('summary');
    };

    // Форматирование даты для отображения
    const formatDateDisplay = () => {
        if (!dateFrom || !dateTo) return '';
        const from = new Date(dateFrom).toLocaleDateString('ru-RU');
        const to = new Date(dateTo).toLocaleDateString('ru-RU');
        return `${from} - ${to}`;
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <div className={styles.container}>
                <h2>Расширенные фильтры</h2>

                <div className={styles.section}>
                    <label className={styles.label}>Период инспекции</label>
                    <div className={styles.dateRangeGroup}>
                        <div className={styles.dateInputWrapper}>
                            <Calendar size={18} className={styles.calendarIcon} />
                            <input
                                type="date"
                                className={styles.dateInput}
                                value={dateFrom}
                                onChange={(e) => setDateFrom(e.target.value)}
                            />
                        </div>
                        <span className={styles.dateSeparator}>—</span>
                        <div className={styles.dateInputWrapper}>
                            <Calendar size={18} className={styles.calendarIcon} />
                            <input
                                type="date"
                                className={styles.dateInput}
                                value={dateTo}
                                onChange={(e) => setDateTo(e.target.value)}
                            />
                        </div>
                    </div>
                    {dateFrom && dateTo && (
                        <div className={styles.dateDisplay}>
                            Выбрано: {formatDateDisplay()}
                        </div>
                    )}
                </div>

                <div className={styles.section}>
                    <h3>Классификация</h3>
                    <div className={styles.row}>
                        <div className={styles.formGroup}>
                            <label>Тип дефекта</label>
                            <select className={styles.select} value={defectType} onChange={(e) => setDefectType(e.target.value)}>
                                <option value="">Выберите типы</option>
                                <option value="corrosion">Коррозия</option>
                                <option value="crack">Трещина</option>
                                <option value="contamination">Загрязнение</option>
                                <option value="damage">Повреждение</option>
                            </select>
                        </div>
                        <div className={styles.formGroup}>
                            <label>Статус элемента</label>
                            <select className={styles.select} value={elementStatus} onChange={(e) => setElementStatus(e.target.value)}>
                                <option value="">Выберите статус</option>
                                <option value="new">Новый</option>
                                <option value="inProgress">В работе</option>
                                <option value="completed">Завершено</option>
                                <option value="critical">Критический</option>
                            </select>
                        </div>
                    </div>

                    <div className={styles.formGroup}>
                        <label>Местоположение</label>
                        <input
                            type="text"
                            className={styles.input}
                            placeholder="Поиск по номеру опоры или линии..."
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                        />
                    </div>
                </div>

                <div className={styles.section}>
                    <label className={styles.label}>Тип отчета</label>
                    <div className={styles.toggleGroup}>
                        <button
                            type="button"
                            className={`${styles.toggleBtn} ${reportType === 'summary' ? styles.active : ''}`}
                            onClick={() => setReportType('summary')}
                        >
                            Сводный
                        </button>
                        <button
                            type="button"
                            className={`${styles.toggleBtn} ${reportType === 'detailed' ? styles.active : ''}`}
                            onClick={() => setReportType('detailed')}
                        >
                            Детальный
                        </button>
                    </div>
                </div>

                <div className={styles.footer}>
                    <button type="button" className={styles.btnReset} onClick={handleReset}>
                        Сбросить
                    </button>
                    <button type="button" className={styles.btnApply} onClick={handleApply}>
                        Применить фильтры
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default AdvancedFiltersModal;
