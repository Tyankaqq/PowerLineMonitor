import React, { useState } from 'react';
import Modal from '../Modal/Modal';
import Toast from '../../common/Toast';  // импорт кастомного Toast
import styles from './ExportReportModal.module.css';

const ExportReportModal = ({ isOpen, onClose, inspections }) => {
    const [format, setFormat] = useState('PDF');
    const [includeCharts, setIncludeCharts] = useState(true);
    const [includePhotos, setIncludePhotos] = useState(false);
    const [includeSummary, setIncludeSummary] = useState(true);
    const [dateFrom, setDateFrom] = useState('01.07.2024');
    const [dateTo, setDateTo] = useState('31.07.2024');
    const [filter, setFilter] = useState('all');

    // Для toast
    const [toastVisible, setToastVisible] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [toastType, setToastType] = useState('success');

    const handleExport = () => {
        let content = '';

        if (format === 'PDF' || format === 'Excel') {
            setToastMessage(`Экспорт в ${format} пока недоступен (требуется библиотека)`);
            setToastType('info');
            setToastVisible(true);
            return;
        }

        // CSV экспорт
        if (format === 'CSV') {
            content = 'ID,Дата,Линия/Элемент,Тип дефекта,Статус,Ответственный\n';
            inspections.forEach(i => {
                content += `${i.id},${i.date},"${i.line}","${i.defectType}",${i.status},${i.responsible}\n`;
            });

            const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `report_${new Date().toISOString().slice(0, 10)}.csv`;
            link.click();

            setToastMessage('Отчет успешно экспортирован!');
            setToastType('success');
            setToastVisible(true);
        }

        onClose();
    };

    return (
        <>
            <Modal isOpen={isOpen} onClose={onClose}>
                <div className={styles.container}>
                    <h2>Настройки экспорта отчета</h2>

                    <div className={styles.section}>
                        <label className={styles.label}>Формат файла</label>
                        <div className={styles.formatButtons}>
                            {['PDF', 'CSV', 'Excel'].map(f => (
                                <button
                                    key={f}
                                    type="button"
                                    className={`${styles.formatBtn} ${format === f ? styles.active : ''}`}
                                    onClick={() => setFormat(f)}
                                >
                                    {f}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className={styles.section}>
                        <label className={styles.label}>Содержание отчета</label>
                        <label className={styles.checkbox}>
                            <input type="checkbox" checked={includeCharts} onChange={(e) => setIncludeCharts(e.target.checked)} />
                            <span>Включить визуализации (графики, диаграммы)</span>
                        </label>
                        <label className={styles.checkbox}>
                            <input type="checkbox" checked={includePhotos} onChange={(e) => setIncludePhotos(e.target.checked)} />
                            <span>Добавить фотографии с инспекций</span>
                        </label>
                        <label className={styles.checkbox}>
                            <input type="checkbox" checked={includeSummary} onChange={(e) => setIncludeSummary(e.target.checked)} />
                            <span>Включить сводную аналитику</span>
                        </label>
                    </div>

                    <div className={styles.footer}>
                        <button className={styles.btnCancel} onClick={onClose}>Отмена</button>
                        <button className={styles.btnExport} onClick={handleExport}>Экспортировать</button>
                    </div>
                </div>
            </Modal>

            {toastVisible && (
                <Toast
                    message={toastMessage}
                    type={toastType}
                    onClose={() => setToastVisible(false)}
                    duration={3000}
                />
            )}
        </>
    );
};

export default ExportReportModal;
