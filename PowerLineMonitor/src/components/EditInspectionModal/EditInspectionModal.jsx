import React, { useState, useEffect } from 'react';
import Modal from '../Modal/Modal';
import styles from './EditInspectionModal.module.css';
import { updateImageCriticality } from '../../API/ImagesAPI/ImagesAPI';

// ИСПРАВЛЕНО: Критичность от 1 до 5
const criticalityOptions = [
    { value: null, label: 'Не указано' },
    { value: 1, label: 'Низкая' },
    { value: 2, label: 'Средняя' },
    { value: 3, label: 'Высокая' },
    { value: 4, label: 'Критическая' },
    { value: 5, label: 'Экстренная' }
];

const EditInspectionModal = ({ isOpen, onClose, inspection, onSave }) => {
    const [formData, setFormData] = useState({
        criticality: null
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (inspection) {
            setFormData({
                criticality: inspection.criticality !== undefined ? inspection.criticality : null
            });
            setError(null);
            setSuccess(false);
        }
    }, [inspection]);

    const handleChange = (field, value) => {
        const numValue = value === '' || value === 'null' ? null : Number(value);
        setFormData(prev => ({ ...prev, [field]: numValue }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(false);

        try {
            await updateImageCriticality(inspection.realId, formData.criticality);
            setSuccess(true);
            onSave({ ...formData });

            setTimeout(() => {
                onClose();
            }, 1000);

        } catch (err) {
            console.error('Ошибка при обновлении критичности:', err);
            setError('Не удалось обновить критичность. Попробуйте снова.');
        } finally {
            setLoading(false);
        }
    };

    if (!inspection) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <form className={styles.container} onSubmit={handleSubmit}>
                <h2>Редактировать Осмотр {inspection.id}</h2>

                {error && (
                    <div className={styles.errorMessage}>
                        ❌ {error}
                    </div>
                )}

                {success && (
                    <div className={styles.successMessage}>
                        ✅ Критичность успешно обновлена!
                    </div>
                )}

                <div className={styles.infoSection}>
                    <div className={styles.infoItem}>
                        <span className={styles.infoLabel}>Дата:</span>
                        <span className={styles.infoValue}>{inspection.date}</span>
                    </div>
                    <div className={styles.infoItem}>
                        <span className={styles.infoLabel}>Тип объекта:</span>
                        <span className={styles.infoValue}>{inspection.objectType}</span>
                    </div>
                    <div className={styles.infoItem}>
                        <span className={styles.infoLabel}>Уверенность:</span>
                        <span className={styles.infoValue}>
                            {(inspection.confidence * 100).toFixed(2)}%
                        </span>
                    </div>
                    <div className={styles.infoItem}>
                        <span className={styles.infoLabel}>Повреждений:</span>
                        <span className={styles.infoValue}>{inspection.countDamage || 0}</span>
                    </div>
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="criticality">Степень критичности</label>
                    <select
                        id="criticality"
                        className={styles.select}
                        value={formData.criticality === null ? 'null' : formData.criticality}
                        onChange={e => handleChange('criticality', e.target.value)}
                    >
                        {criticalityOptions.map(opt => (
                            <option
                                key={opt.value === null ? 'null' : opt.value}
                                value={opt.value === null ? 'null' : opt.value}
                            >
                                {opt.label}
                            </option>
                        ))}
                    </select>
                    <p className={styles.helpText}>
                        Выберите уровень критичности обнаруженного дефекта (от 1 до 5)
                    </p>
                </div>

                <div className={styles.footer}>
                    <button
                        type="button"
                        className={styles.btnCancel}
                        onClick={onClose}
                        disabled={loading}
                    >
                        Отмена
                    </button>
                    <button
                        type="submit"
                        className={styles.btnSave}
                        disabled={loading}
                    >
                        {loading ? 'Сохранение...' : 'Сохранить'}
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default EditInspectionModal;
