// src/components/EditInspectionModal/EditInspectionModal.jsx
import React, { useState, useEffect } from 'react';
import Modal from '../Modal/Modal';
import styles from './EditInspectionModal.module.css';

const statusOptions = [
    { value: 'in_work', label: 'В работе' },
    { value: 'new', label: 'Новый' },
    { value: 'completed', label: 'Завершено' },
];

const severityOptions = [
    { value: 'critical', label: 'Критический' },
    { value: 'warning', label: 'Внимание' },
    { value: 'normal', label: 'Норма' },
];

const defectTypeOptions = [
    { value: '', label: 'Выберите тип дефекта' },
    { value: 'Коррозия', label: 'Коррозия' },
    { value: 'Трещина', label: 'Трещина' },
    { value: 'Загрязнение', label: 'Загрязнение' },
];

const EditInspectionModal = ({ isOpen, onClose, inspection, onSave }) => {
    const [formData, setFormData] = useState({
        defectType: '',
        status: '',
        severity: '',
        description: '',
    });

    useEffect(() => {
        if (inspection) {
            setFormData({
                defectType: inspection.defectType || '',
                status: inspection.status || '',
                severity: inspection.severity || '',
                description: inspection.description || '',
            });
        }
    }, [inspection]);

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = e => {
        e.preventDefault();
        onSave(formData);
    };

    if (!inspection) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <form className={styles.container} onSubmit={handleSubmit}>
                <h2>Редактировать Дефект {inspection.id}</h2>

                <div className={styles.formGroup}>
                    <label>Тип дефекта</label>
                    <select
                        className={styles.select}
                        value={formData.defectType}
                        onChange={e => handleChange('defectType', e.target.value)}
                        required
                    >
                        {defectTypeOptions.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                </div>

                <div className={styles.formGroup}>
                    <label>Статус</label>
                    <select
                        className={styles.select}
                        value={formData.status}
                        onChange={e => handleChange('status', e.target.value)}
                        required
                    >
                        {statusOptions.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                </div>

                <div className={styles.formGroup}>
                    <label>Степень повреждения</label>
                    <select
                        className={styles.select}
                        value={formData.severity}
                        onChange={e => handleChange('severity', e.target.value)}
                        required
                    >
                        {severityOptions.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                </div>

                <div className={styles.formGroup}>
                    <label>Описание дефекта (опционально)</label>
                    <textarea
                        className={styles.textarea}
                        value={formData.description}
                        onChange={e => handleChange('description', e.target.value)}
                        rows={3}
                        placeholder="Добавьте подробности..."
                    />
                </div>

                <div className={styles.footer}>
                    <button type="button" className={styles.btnCancel} onClick={onClose}>
                        Отмена
                    </button>
                    <button type="submit" className={styles.btnSave}>
                        Сохранить
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default EditInspectionModal;
