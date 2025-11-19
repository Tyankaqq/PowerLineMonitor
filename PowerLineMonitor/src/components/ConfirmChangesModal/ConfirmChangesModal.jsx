// src/components/ConfirmChangesModal/ConfirmChangesModal.jsx
import React from 'react';
import Modal from '../Modal/Modal';
import { AlertTriangle } from 'lucide-react';
import styles from './ConfirmChangesModal.module.css';

const statusLabels = {
    in_work: 'В работе',
    new: 'Новый',
    completed: 'Завершено',
};

const severityLabels = {
    critical: 'Критический',
    warning: 'Внимание',
    normal: 'Норма',
};

const ConfirmChangesModal = ({ isOpen, onClose, onConfirm, original, edited }) => {
    if (!original || !edited) return null;

    const getChanges = () => {
        const changes = [];
        if (edited.defectType && edited.defectType !== original.defectType) {
            changes.push({ field: 'Тип дефекта', from: original.defectType || '—', to: edited.defectType });
        }
        if (edited.status && edited.status !== original.status) {
            changes.push({ field: 'Статус', from: statusLabels[original.status] || original.status, to: statusLabels[edited.status] || edited.status });
        }
        if (edited.severity && edited.severity !== original.severity) {
            changes.push({ field: 'Степень повреждения', from: severityLabels[original.severity] || original.severity, to: severityLabels[edited.severity] || edited.severity });
        }
        if (edited.description !== undefined && edited.description !== original.description) {
            changes.push({ field: 'Описание', from: original.description || '—', to: edited.description || '—' });
        }
        return changes;
    };

    const changes = getChanges();

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <div className={styles.container}>
                <h2>Подтверждение изменения</h2>
                <div className={styles.icon}>
                    <AlertTriangle size={40} color="#f59e0b" />
                </div>

                {changes.length > 0 ? (
                    <>
                        <p>Вы уверены, что хотите внести следующие изменения?</p>
                        <div className={styles.changesList}>
                            {changes.map(({ field, from, to }, idx) => (
                                <div key={idx} className={styles.changeItem}>
                                    <strong>{field}:</strong> <del>{from}</del> → <span>{to}</span>
                                </div>
                            ))}
                        </div>
                    </>
                ) : (
                    <p>Изменений не обнаружено.</p>
                )}

                <div className={styles.footer}>
                    <button className={styles.btnCancel} onClick={onClose}>Отмена</button>
                    <button className={styles.btnConfirm} onClick={onConfirm} disabled={changes.length === 0}>Подтвердить</button>
                </div>
            </div>
        </Modal>
    );
};

export default ConfirmChangesModal;
