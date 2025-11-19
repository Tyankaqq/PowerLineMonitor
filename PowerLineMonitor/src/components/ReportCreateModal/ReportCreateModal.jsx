import React, { useState } from 'react';
import Modal from '../Modal/Modal';
import styles from './ReportCreateModal.module.css';

const REPORT_TYPES = [
    { label: 'Общий отчет', value: 'Общий отчет' },
    { label: 'Дефекты', value: 'Дефекты' },
    { label: 'Аналитика', value: 'Аналитика' }
];

const PERIODS = [
    { label: 'За неделю', value: 'За неделю' },
    { label: 'За месяц', value: 'За месяц' },
    { label: 'За квартал', value: 'За квартал' },
    { label: 'За год', value: 'За год' }
];

const ReportCreateModal = ({ isOpen, onClose, onSubmit }) => {
    const [name, setName] = useState('');
    const [type, setType] = useState(REPORT_TYPES[0].value);
    const [period, setPeriod] = useState(PERIODS[0].value);
    const [description, setDescription] = useState('');
    const [touched, setTouched] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        setTouched(true);
        if (!name.trim()) return;
        onSubmit?.({ name, type, period, description });
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <form className={styles.modalBody} onSubmit={handleSubmit}>
                <h2 className={styles.title}>Создать новый отчет</h2>
                <p className={styles.subtitle}>Создайте отчет на основе текущих данных мониторинга</p>

                <div className={styles.formGroup}>
                    <label className={styles.label}>Название отчета *</label>
                    <input
                        className={`${styles.input} ${touched && !name.trim() ? styles.inputError : ''}`}
                        type="text"
                        placeholder="Например: Еженедельный осмотр ЛЭП-220"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                    {touched && !name.trim() && (
                        <span className={styles.error}>Укажите название отчета</span>
                    )}
                </div>

                <div className={styles.formGroup}>
                    <label className={styles.label}>Тип отчета</label>
                    <select
                        className={styles.input}
                        value={type}
                        onChange={(e) => setType(e.target.value)}
                    >
                        {REPORT_TYPES.map(opt => (
                            <option value={opt.value} key={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                </div>

                <div className={styles.formGroup}>
                    <label className={styles.label}>Период</label>
                    <select
                        className={styles.input}
                        value={period}
                        onChange={(e) => setPeriod(e.target.value)}
                    >
                        {PERIODS.map(opt => (
                            <option value={opt.value} key={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                </div>

                <div className={styles.formGroup}>
                    <label className={styles.label}>Описание (опционально)</label>
                    <textarea
                        className={styles.input}
                        placeholder="Добавьте описание отчета…"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={2}
                    />
                </div>

                <div className={styles.reportInfo}>
                    <div className={styles.infoTitle}>Отчет будет включать:</div>
                    <ul>
                        <li>Сводная статистика осмотров</li>
                        <li>Список обнаруженных дефектов</li>
                        <li>Графики и диаграммы</li>
                        <li>Рекомендации по устранению</li>
                    </ul>
                </div>

                <div className={styles.footer}>
                    <button type="button" className={styles.btnGhost} onClick={onClose}>
                        Отмена
                    </button>
                    <button type="submit" className={styles.btnPrimary} disabled={!name.trim()}>
                        Создать отчет
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default ReportCreateModal;
